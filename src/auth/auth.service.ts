import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existente) throw new ConflictException('E-mail já cadastrado');

    const senha = await bcrypt.hash(dto.senha, 10);
    const usuario = await this.prisma.usuario.create({
      data: { nome: dto.nome, email: dto.email, senha },
    });

    // nunca devolver a senha (nem o hash)
    return { id: usuario.id, nome: usuario.nome, email: usuario.email };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (!usuario || !(await bcrypt.compare(dto.senha, usuario.senha))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const access_token = await this.jwt.signAsync({
      sub: usuario.id,
      email: usuario.email,
    });

    return {
      access_token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    };
  }
}
