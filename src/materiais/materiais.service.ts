import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMaterialDto } from './dto/create-material.dto.js';
import { UpdateMaterialDto } from './dto/update-material.dto.js';

@Injectable()
export class MateriaisService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMaterialDto) {
    await this.garantirNomeLivre(dto.nome);
    return this.prisma.material.create({ data: dto });
  }

  findAll() {
    return this.prisma.material.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: number) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        produtos: {
          include: { produto: { select: { id: true, nome: true } } },
        },
      },
    });
    if (!material) throw new NotFoundException(`Material ${id} não encontrado`);
    return material;
  }

  async update(id: number, dto: UpdateMaterialDto) {
    await this.findOne(id);
    if (dto.nome) await this.garantirNomeLivre(dto.nome, id);
    return this.prisma.material.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const material = await this.findOne(id);
    if (material.produtos.length > 0) {
      throw new ConflictException(
        'Não é possível excluir: o material é usado em produtos',
      );
    }
    return this.prisma.material.delete({ where: { id } });
  }

  private async garantirNomeLivre(nome: string, ignorarId?: number) {
    const existente = await this.prisma.material.findUnique({ where: { nome } });
    if (existente && existente.id !== ignorarId) {
      throw new ConflictException('Já existe um material com esse nome');
    }
  }
}
