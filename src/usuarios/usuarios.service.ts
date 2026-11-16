import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HistoricoService } from '../historico/historico.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

// Nunca devolver a senha (nem o hash): toda consulta usa este select.
const CAMPOS_PUBLICOS = { id: true, nome: true, email: true } as const;

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly historico: HistoricoService,
  ) {}

  async create(dto: CreateUsuarioDto, idLogado: number) {
    await this.garantirEmailLivre(dto.email);
    const senha = await bcrypt.hash(dto.senha, 10);
    const usuario = await this.prisma.usuario.create({
      data: { nome: dto.nome, email: dto.email, senha },
      select: CAMPOS_PUBLICOS,
    });
    await this.historico.registrar({
      usuarioId: idLogado,
      acao: 'CADASTRO',
      tipoRegistro: 'ADMINISTRADOR',
      registroId: usuario.id,
      registroNome: usuario.nome,
    });
    return usuario;
  }

  findAll() {
    return this.prisma.usuario.findMany({
      select: CAMPOS_PUBLICOS,
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: CAMPOS_PUBLICOS,
    });
    if (!usuario) throw new NotFoundException(`Usuário ${id} não encontrado`);
    return usuario;
  }

  async update(id: number, dto: UpdateUsuarioDto, idLogado: number) {
    await this.findOne(id);
    if (dto.email) await this.garantirEmailLivre(dto.email, id);

    const data: { nome?: string; email?: string; senha?: string } = {
      nome: dto.nome,
      email: dto.email,
    };
    if (dto.senha) data.senha = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.usuario.update({
      where: { id },
      data,
      select: CAMPOS_PUBLICOS,
    });
    await this.historico.registrar({
      usuarioId: idLogado,
      acao: 'EDICAO',
      tipoRegistro: 'ADMINISTRADOR',
      registroId: id,
      registroNome: usuario.nome,
    });
    return usuario;
  }

  async remove(id: number, idLogado: number) {
    const usuario = await this.findOne(id);
    if (id === idLogado) {
      throw new ConflictException('Você não pode excluir o próprio usuário');
    }
    const pedidos = await this.prisma.pedido.count({ where: { usuarioId: id } });
    if (pedidos > 0) {
      throw new ConflictException(
        'Não é possível excluir: o usuário possui pedidos registrados',
      );
    }
    await this.prisma.usuario.delete({ where: { id } });
    await this.historico.registrar({
      usuarioId: idLogado,
      acao: 'EXCLUSAO',
      tipoRegistro: 'ADMINISTRADOR',
      registroId: id,
      registroNome: usuario.nome,
    });
    return { id };
  }

  private async garantirEmailLivre(email: string, ignorarId?: number) {
    const existente = await this.prisma.usuario.findUnique({ where: { email } });
    if (existente && existente.id !== ignorarId) {
      throw new ConflictException('E-mail já cadastrado');
    }
  }
}
