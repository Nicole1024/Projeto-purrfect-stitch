import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { UsuariosService } from './usuarios.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

// Protegido pelo AuthGuard global: só quem está logado administra usuários.
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Post()
  create(@Body() dto: CreateUsuarioDto, @CurrentUser() logado: JwtPayload) {
    return this.usuarios.create(dto, logado.sub);
  }

  @Get()
  findAll() {
    return this.usuarios.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarios.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
    @CurrentUser() logado: JwtPayload,
  ) {
    return this.usuarios.update(id, dto, logado.sub);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() logado: JwtPayload,
  ) {
    return this.usuarios.remove(id, logado.sub);
  }
}
