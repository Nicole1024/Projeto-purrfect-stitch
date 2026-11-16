import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { StatusPedido } from '../generated/prisma/client.js';
import { PedidosService } from './pedidos.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { UpdatePedidoDto } from './dto/update-pedido.dto.js';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidos: PedidosService) {}

  // O usuário que registra o pedido vem do token JWT.
  @Post()
  create(@Body() dto: CreatePedidoDto, @CurrentUser() usuario: JwtPayload) {
    return this.pedidos.create(dto, usuario.sub);
  }

  // GET /pedidos?status=PENDENTE
  @Get()
  findAll(
    @Query('status', new ParseEnumPipe(StatusPedido, { optional: true }))
    status?: StatusPedido,
  ) {
    return this.pedidos.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pedidos.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePedidoDto,
  ) {
    return this.pedidos.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pedidos.remove(id);
  }
}
