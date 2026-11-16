import {
  Controller,
  Get,
  ParseEnumPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AcaoHistorico } from '../generated/prisma/client.js';
import { HistoricoService } from './historico.service.js';

// Somente leitura: o histórico não pode ser alterado nem excluído pela API.
@Controller('historico')
export class HistoricoController {
  constructor(private readonly historico: HistoricoService) {}

  // GET /historico?administradorId=1&acao=EDICAO&de=2026-11-01&ate=2026-11-30
  @Get()
  listar(
    @Query('administradorId', new ParseIntPipe({ optional: true }))
    administradorId?: number,
    @Query('acao', new ParseEnumPipe(AcaoHistorico, { optional: true }))
    acao?: AcaoHistorico,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
  ) {
    return this.historico.listar({ administradorId, acao, de, ate });
  }
}
