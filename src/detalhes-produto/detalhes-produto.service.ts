import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDetalheProdutoDto } from './dto/create-detalhe-produto.dto.js';
import { UpdateDetalheProdutoDto } from './dto/update-detalhe-produto.dto.js';

@Injectable()
export class DetalhesProdutoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(produtoId: number, dto: CreateDetalheProdutoDto) {
    await this.garantirProduto(produtoId);

    // Regra de negócio do 1:1: um produto só pode ter UM detalhe.
    const existente = await this.prisma.detalheProduto.findUnique({
      where: { produtoId },
    });
    if (existente) {
      throw new ConflictException('Esse produto já possui detalhes cadastrados');
    }

    return this.prisma.detalheProduto.create({ data: { produtoId, ...dto } });
  }

  async findOne(produtoId: number) {
    await this.garantirProduto(produtoId);
    const detalhe = await this.prisma.detalheProduto.findUnique({
      where: { produtoId },
    });
    if (!detalhe) {
      throw new NotFoundException(`Produto ${produtoId} não possui detalhes`);
    }
    return detalhe;
  }

  async update(produtoId: number, dto: UpdateDetalheProdutoDto) {
    await this.findOne(produtoId);
    return this.prisma.detalheProduto.update({ where: { produtoId }, data: dto });
  }

  async remove(produtoId: number) {
    await this.findOne(produtoId);
    return this.prisma.detalheProduto.delete({ where: { produtoId } });
  }

  private async garantirProduto(produtoId: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id: produtoId },
      select: { id: true },
    });
    if (!produto) throw new NotFoundException(`Produto ${produtoId} não encontrado`);
  }
}
