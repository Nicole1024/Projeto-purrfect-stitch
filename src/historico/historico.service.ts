import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AcaoHistorico,
  TipoRegistro,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export interface EventoHistorico {
  usuarioId: number;
  acao: AcaoHistorico;
  tipoRegistro: TipoRegistro;
  registroId: number;
  registroNome: string;
}

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

@Injectable()
export class HistoricoService {
  constructor(private readonly prisma: PrismaService) {}

  // Chamado pelos outros services depois de cadastrar/editar/excluir.
  async registrar(evento: EventoHistorico) {
    const admin = await this.prisma.usuario.findUnique({
      where: { id: evento.usuarioId },
      select: { nome: true },
    });
    return this.prisma.historico.create({
      data: {
        administradorId: evento.usuarioId,
        administradorNome: admin?.nome ?? 'Desconhecido',
        acao: evento.acao,
        tipoRegistro: evento.tipoRegistro,
        registroId: evento.registroId,
        registroNome: evento.registroNome,
      },
    });
  }

  listar(filtros: {
    administradorId?: number;
    acao?: AcaoHistorico;
    de?: string;
    ate?: string;
  }) {
    const { de, ate } = filtros;
    if ((de && !DATA_ISO.test(de)) || (ate && !DATA_ISO.test(ate))) {
      throw new BadRequestException('Use datas no formato AAAA-MM-DD');
    }
    // Dia inteiro no fuso de Brasília (UTC-3).
    const inicio = de ? new Date(`${de}T00:00:00-03:00`) : undefined;
    const fim = ate ? new Date(`${ate}T23:59:59.999-03:00`) : undefined;

    return this.prisma.historico.findMany({
      where: {
        administradorId: filtros.administradorId,
        acao: filtros.acao,
        dataHora: { gte: inicio, lte: fim },
      },
      orderBy: { dataHora: 'desc' },
    });
  }
}
