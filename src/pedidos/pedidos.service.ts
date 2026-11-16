import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusPedido } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdatePedidoDto } from './dto/update-pedido.dto.js';

const INCLUIR_PEDIDO = {
  usuario: { select: { id: true, nome: true, email: true } },
  itens: { include: { produto: { select: { id: true, nome: true } } } },
} satisfies Prisma.PedidoInclude;

// Transições de status permitidas. CANCELADO é um estado final.
const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  PENDENTE: ['CONCLUIDO', 'CANCELADO'],
  CONCLUIDO: ['CANCELADO'],
  CANCELADO: [],
};

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  // Regras de negócio:
  //  - todos os produtos precisam existir;
  //  - não pode vender mais do que há em estoque (estoque nunca fica negativo);
  //  - o preço do item é "congelado" no momento da venda;
  //  - tudo acontece em UMA transação: se um item falhar, nada é gravado.
  async create(dto: CreatePedidoDto, usuarioId: number) {
    const quantidades = new Map<number, number>();
    for (const item of dto.itens) {
      quantidades.set(
        item.produtoId,
        (quantidades.get(item.produtoId) ?? 0) + item.quantidade,
      );
    }
    const ids = [...quantidades.keys()];

    return this.prisma.$transaction(async (tx) => {
      const produtos = await tx.produto.findMany({ where: { id: { in: ids } } });

      if (produtos.length !== ids.length) {
        const encontrados = new Set(produtos.map((p) => p.id));
        const faltando = ids.filter((id) => !encontrados.has(id));
        throw new BadRequestException(
          `Produto(s) inexistente(s): ${faltando.join(', ')}`,
        );
      }

      let total = 0;
      const itens: Prisma.ItemPedidoCreateWithoutPedidoInput[] = [];

      for (const produto of produtos) {
        const quantidade = quantidades.get(produto.id)!;

        // Baixa atômica: só decrementa se ainda houver saldo suficiente.
        const { count } = await tx.produto.updateMany({
          where: { id: produto.id, quantidade: { gte: quantidade } },
          data: { quantidade: { decrement: quantidade } },
        });
        if (count === 0) {
          throw new BadRequestException(
            `Estoque insuficiente para "${produto.nome}" ` +
              `(disponível: ${produto.quantidade}, pedido: ${quantidade})`,
          );
        }

        total += produto.preco * quantidade;
        itens.push({
          quantidade,
          precoUnitario: produto.preco,
          produto: { connect: { id: produto.id } },
        });
      }

      return tx.pedido.create({
        data: {
          clienteNome: dto.clienteNome,
          usuarioId,
          total: Math.round(total * 100) / 100,
          itens: { create: itens },
        },
        include: INCLUIR_PEDIDO,
      });
    });
  }

  findAll(status?: StatusPedido) {
    return this.prisma.pedido.findMany({
      where: { status },
      include: INCLUIR_PEDIDO,
      orderBy: { data: 'desc' },
    });
  }

  async findOne(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: INCLUIR_PEDIDO,
    });
    if (!pedido) throw new NotFoundException(`Pedido ${id} não encontrado`);
    return pedido;
  }

  async update(id: number, dto: UpdatePedidoDto) {
    const pedido = await this.findOne(id);
    const novoStatus = dto.status;
    const mudaStatus = novoStatus !== undefined && novoStatus !== pedido.status;

    if (mudaStatus && !TRANSICOES[pedido.status].includes(novoStatus)) {
      throw new ConflictException(
        `Não é possível mudar o pedido de ${pedido.status} para ${novoStatus}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Cancelar devolve os produtos ao estoque.
      if (mudaStatus && novoStatus === 'CANCELADO') {
        await this.devolverEstoque(tx, id);
      }
      return tx.pedido.update({
        where: { id },
        data: { clienteNome: dto.clienteNome, status: dto.status },
        include: INCLUIR_PEDIDO,
      });
    });
  }

  async remove(id: number) {
    const pedido = await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      // Pedido que ainda "segurava" estoque devolve os produtos ao excluir.
      if (pedido.status !== 'CANCELADO') await this.devolverEstoque(tx, id);
      return tx.pedido.delete({ where: { id } });
    });
  }

  private async devolverEstoque(tx: Prisma.TransactionClient, pedidoId: number) {
    const itens = await tx.itemPedido.findMany({ where: { pedidoId } });
    for (const item of itens) {
      await tx.produto.update({
        where: { id: item.produtoId },
        data: { quantidade: { increment: item.quantidade } },
      });
    }
  }
}
