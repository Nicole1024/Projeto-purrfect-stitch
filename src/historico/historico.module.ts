import { Global, Module } from '@nestjs/common';
import { HistoricoController } from './historico.controller.js';
import { HistoricoService } from './historico.service.js';

// @Global: qualquer módulo pode injetar o HistoricoService sem importar este.
@Global()
@Module({
  controllers: [HistoricoController],
  providers: [HistoricoService],
  exports: [HistoricoService],
})
export class HistoricoModule {}
