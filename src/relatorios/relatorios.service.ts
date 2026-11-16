import { Injectable } from '@nestjs/common';
import { StatusPedido } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const ESTOQUE_BAIXO_PRODUTOS = 3;
const ESTOQUE_BAIXO_MATERIAIS = 5;

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  // Pedido + usuário + itens + produto + categoria (5 tabelas em uma consulta)
  pedidosDetalhados(status?: StatusPedido) {
    return this.prisma.pedido.findMany({
      where: { status },
      orderBy: { data: 'desc' },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        itens: {
          include: {
            produto: { include: { categoria: true, detalhe: true } },
          },
        },
      },
    });
  }

  // Categoria + produtos + detalhe (1:1) + materiais (N:N)
  catalogo() {
    return this.prisma.categoria.findMany({
      orderBy: { nome: 'asc' },
      include: {
        produtos: {
          orderBy: { nome: 'asc' },
          include: {
            detalhe: true,
            materiais: { include: { material: true } },
          },
        },
      },
    });
  }

  // Totais da loja, vendas por status, mais vendidos e alertas de estoque.
  async dashboard() {
    const [
      totalProdutos,
      totalMateriais,
      pedidosPorStatus,
      faturamento,
      produtosEstoqueBaixo,
      materiaisEstoqueBaixo,
      maisVendidosBruto,
    ] = await Promise.all([
      this.prisma.produto.count(),
      this.prisma.material.count(),
      this.prisma.pedido.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.pedido.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELADO' } },
      }),
      this.prisma.produto.findMany({
        where: { quantidade: { lte: ESTOQUE_BAIXO_PRODUTOS } },
        include: { categoria: { select: { nome: true } } },
        orderBy: { quantidade: 'asc' },
      }),
      this.prisma.material.findMany({
        where: { quantidade: { lte: ESTOQUE_BAIXO_MATERIAIS } },
        orderBy: { quantidade: 'asc' },
      }),
      this.prisma.itemPedido.groupBy({
        by: ['produtoId'],
        where: { pedido: { status: { not: 'CANCELADO' } } },
        _sum: { quantidade: true },
        orderBy: { _sum: { quantidade: 'desc' } },
        take: 5,
      }),
    ]);

    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: maisVendidosBruto.map((m) => m.produtoId) } },
      include: { categoria: { select: { nome: true } } },
    });
    const maisVendidos = maisVendidosBruto.map((m) => {
      const produto = produtos.find((p) => p.id === m.produtoId);
      return {
        produtoId: m.produtoId,
        nome: produto?.nome,
        categoria: produto?.categoria.nome,
        unidadesVendidas: m._sum.quantidade ?? 0,
      };
    });

    return {
      totalProdutos,
      totalMateriais,
      faturamento: faturamento._sum.total ?? 0,
      pedidosPorStatus: pedidosPorStatus.map((p) => ({
        status: p.status,
        quantidade: p._count._all,
      })),
      maisVendidos,
      alertasEstoque: {
        limiteProdutos: ESTOQUE_BAIXO_PRODUTOS,
        limiteMateriais: ESTOQUE_BAIXO_MATERIAIS,
        produtos: produtosEstoqueBaixo,
        materiais: materiaisEstoqueBaixo,
      },
    };
  }
}
