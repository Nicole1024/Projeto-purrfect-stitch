import { Module } from '@nestjs/common';
import { DetalhesProdutoController } from './detalhes-produto.controller.js';
import { DetalhesProdutoService } from './detalhes-produto.service.js';

@Module({
  controllers: [DetalhesProdutoController],
  providers: [DetalhesProdutoService],
})
export class DetalhesProdutoModule {}
