import { Controller, Get, ParseEnumPipe, Query } from '@nestjs/common';
import { StatusPedido } from '../generated/prisma/client.js';
import { RelatoriosService } from './relatorios.service.js';

@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatorios: RelatoriosService) {}

  // GET /relatorios/pedidos-detalhados?status=CONCLUIDO
  @Get('pedidos-detalhados')
  pedidosDetalhados(
    @Query('status', new ParseEnumPipe(StatusPedido, { optional: true }))
    status?: StatusPedido,
  ) {
    return this.relatorios.pedidosDetalhados(status);
  }

  @Get('catalogo')
  catalogo() {
    return this.relatorios.catalogo();
  }

  @Get('dashboard')
  dashboard() {
    return this.relatorios.dashboard();
  }
}
