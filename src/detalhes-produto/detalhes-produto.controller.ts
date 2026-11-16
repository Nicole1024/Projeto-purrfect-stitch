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
import { DetalhesProdutoService } from './detalhes-produto.service.js';
import { CreateDetalheProdutoDto } from './dto/create-detalhe-produto.dto.js';
import { UpdateDetalheProdutoDto } from './dto/update-detalhe-produto.dto.js';

// Relação 1:1: o detalhe é sempre acessado a partir do produto.
@Controller('produtos/:produtoId/detalhe')
export class DetalhesProdutoController {
  constructor(private readonly detalhes: DetalhesProdutoService) {}

  @Post()
  create(
    @Param('produtoId', ParseIntPipe) produtoId: number,
    @Body() dto: CreateDetalheProdutoDto,
  ) {
    return this.detalhes.create(produtoId, dto);
  }

  @Get()
  findOne(@Param('produtoId', ParseIntPipe) produtoId: number) {
    return this.detalhes.findOne(produtoId);
  }

  @Patch()
  update(
    @Param('produtoId', ParseIntPipe) produtoId: number,
    @Body() dto: UpdateDetalheProdutoDto,
  ) {
    return this.detalhes.update(produtoId, dto);
  }

  @Delete()
  remove(@Param('produtoId', ParseIntPipe) produtoId: number) {
    return this.detalhes.remove(produtoId);
  }
}
