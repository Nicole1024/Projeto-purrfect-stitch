import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

// Converte erros conhecidos do Prisma em respostas HTTP coerentes.
//   P2002 -> 409 (violação de campo único)
//   P2003 -> 409 (chave estrangeira: registro em uso ou referência inexistente)
//   P2025 -> 404 (registro não encontrado em update/delete)
// Qualquer outro erro do Prisma vira 500.
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(erro: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const resposta = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';

    switch (erro.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'Já existe um registro com esse valor único';
        break;
      case 'P2003':
        status = HttpStatus.CONFLICT;
        message = 'Operação bloqueada: o registro está relacionado a outros dados';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Registro não encontrado';
        break;
    }

    resposta.status(status).json({ statusCode: status, message });
  }
}
