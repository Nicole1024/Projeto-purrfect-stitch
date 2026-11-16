import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoriaDto) {
    await this.garantirNomeLivre(dto.nome);
    return this.prisma.categoria.create({ data: dto });
  }

  findAll() {
    return this.prisma.categoria.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { produtos: true } } },
    });
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: { produtos: { select: { id: true, nome: true, preco: true } } },
    });
    if (!categoria) throw new NotFoundException(`Categoria ${id} não encontrada`);
    return categoria;
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    await this.findOne(id);
    if (dto.nome) await this.garantirNomeLivre(dto.nome, id);
    return this.prisma.categoria.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);
    if (categoria.produtos.length > 0) {
      throw new ConflictException(
        'Não é possível excluir: a categoria possui produtos cadastrados',
      );
    }
    return this.prisma.categoria.delete({ where: { id } });
  }

  private async garantirNomeLivre(nome: string, ignorarId?: number) {
    const existente = await this.prisma.categoria.findUnique({ where: { nome } });
    if (existente && existente.id !== ignorarId) {
      throw new ConflictException('Já existe uma categoria com esse nome');
    }
  }
}
