import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { removerImagem, salvarImagem } from '../common/imagem.js';
import type { ArquivoEnviado } from '../common/imagem.js';
import { HistoricoService } from '../historico/historico.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AddMaterialDto } from './dto/add-material.dto.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';

// Valores aceitos em ?ordenarPor= e ?direcao= (usados pelo ParseEnumPipe).
export const CAMPOS_ORDENACAO = {
  nome: 'nome',
  preco: 'preco',
  data: 'data',
} as const;
export const DIRECOES = { asc: 'asc', desc: 'desc' } as const;
export type CampoOrdenacao = keyof typeof CAMPOS_ORDENACAO;
export type Direcao = keyof typeof DIRECOES;

// Nome do admin que cadastrou / alterou (nunca expõe e-mail nem senha).
const AUTOR = { select: { id: true, nome: true } } as const;

@Injectable()
export class ProdutosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly historico: HistoricoService,
  ) {}

  async create(
    dto: CreateProdutoDto,
    usuarioId: number,
    imagem?: ArquivoEnviado,
  ) {
    await this.garantirCategoria(dto.categoriaId);
    const imagemUrl = imagem ? await salvarImagem(imagem) : undefined;

    const produto = await this.prisma.produto.create({
      data: {
        ...dto,
        imagemUrl,
        criadoPorId: usuarioId,
        atualizadoPorId: usuarioId,
      },
      include: { categoria: true, criadoPor: AUTOR, atualizadoPor: AUTOR },
    });
    await this.historico.registrar({
      usuarioId,
      acao: 'CADASTRO',
      tipoRegistro: 'PRODUTO',
      registroId: produto.id,
      registroNome: produto.nome,
    });
    return produto;
  }

  findAll(
    filtros: {
      categoriaId?: number;
      busca?: string;
      ordenarPor?: CampoOrdenacao;
      direcao?: Direcao;
    } = {},
  ) {
    // "data" no front = quando o produto foi cadastrado (criadoEm no banco).
    const direcao = filtros.direcao ?? 'asc';
    const orderBy =
      filtros.ordenarPor === 'preco'
        ? { preco: direcao }
        : filtros.ordenarPor === 'data'
          ? { criadoEm: direcao }
          : { nome: direcao };
    return this.prisma.produto.findMany({
      where: {
        categoriaId: filtros.categoriaId,
        nome: filtros.busca
          ? { contains: filtros.busca, mode: 'insensitive' }
          : undefined,
      },
      include: { categoria: true, criadoPor: AUTOR, atualizadoPor: AUTOR },
      orderBy,
    });
  }

  async findOne(id: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: {
        categoria: true,
        criadoPor: AUTOR,
        atualizadoPor: AUTOR,
        detalhe: true,
        materiais: { include: { material: true } },
      },
    });
    if (!produto) throw new NotFoundException(`Produto ${id} não encontrado`);
    return produto;
  }

  async update(
    id: number,
    dto: UpdateProdutoDto,
    usuarioId: number,
    imagem?: ArquivoEnviado,
  ) {
    const atual = await this.findOne(id);
    if (dto.categoriaId !== undefined) await this.garantirCategoria(dto.categoriaId);
    // Sem arquivo novo, a imagem atual é mantida.
    const imagemUrl = imagem ? await salvarImagem(imagem) : undefined;

    const produto = await this.prisma.produto.update({
      where: { id },
      data: { ...dto, imagemUrl, atualizadoPorId: usuarioId },
      include: { categoria: true, criadoPor: AUTOR, atualizadoPor: AUTOR },
    });
    if (imagemUrl) await removerImagem(atual.imagemUrl);
    await this.historico.registrar({
      usuarioId,
      acao: 'EDICAO',
      tipoRegistro: 'PRODUTO',
      registroId: id,
      registroNome: produto.nome,
    });
    return produto;
  }

  async remove(id: number, usuarioId: number) {
    const produto = await this.findOne(id);
    const vendas = await this.prisma.itemPedido.count({ where: { produtoId: id } });
    if (vendas > 0) {
      throw new ConflictException(
        'Não é possível excluir: o produto já aparece em pedidos',
      );
    }
    // detalhe (1:1) e receita (N:N) são removidos em cascata pelo banco
    const removido = await this.prisma.produto.delete({ where: { id } });
    await removerImagem(produto.imagemUrl);
    await this.historico.registrar({
      usuarioId,
      acao: 'EXCLUSAO',
      tipoRegistro: 'PRODUTO',
      registroId: id,
      registroNome: produto.nome,
    });
    return removido;
  }

  // ---- N:N Produto <-> Material (receita) ----

  async adicionarMaterial(produtoId: number, dto: AddMaterialDto) {
    await this.findOne(produtoId);
    const material = await this.prisma.material.findUnique({
      where: { id: dto.materialId },
    });
    if (!material) throw new BadRequestException('Material informado não existe');

    const jaExiste = await this.prisma.produtoMaterial.findUnique({
      where: {
        produtoId_materialId: { produtoId, materialId: dto.materialId },
      },
    });
    if (jaExiste) {
      throw new ConflictException('Esse material já faz parte do produto');
    }

    return this.prisma.produtoMaterial.create({
      data: { produtoId, ...dto },
      include: { material: true },
    });
  }

  async removerMaterial(produtoId: number, materialId: number) {
    const vinculo = await this.prisma.produtoMaterial.findUnique({
      where: { produtoId_materialId: { produtoId, materialId } },
    });
    if (!vinculo) {
      throw new NotFoundException('Esse material não faz parte do produto');
    }
    return this.prisma.produtoMaterial.delete({
      where: { produtoId_materialId: { produtoId, materialId } },
    });
  }

  private async garantirCategoria(categoriaId: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: categoriaId },
    });
    if (!categoria) throw new BadRequestException('Categoria informada não existe');
  }
}
