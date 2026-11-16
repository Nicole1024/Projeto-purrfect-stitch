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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.js';
import { LIMITE_IMAGEM_BYTES } from '../common/imagem.js';
import type { ArquivoEnviado } from '../common/imagem.js';
import {
  DIRECOES,
  CAMPOS_ORDENACAO,
  ProdutosService,
} from './produtos.service.js';
import type { Direcao, CampoOrdenacao } from './produtos.service.js';
import { AddMaterialDto } from './dto/add-material.dto.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';

// Aceita JSON ou multipart/form-data (campo de arquivo: "imagem").
const receberImagem = () =>
  FileInterceptor('imagem', { limits: { fileSize: LIMITE_IMAGEM_BYTES } });

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtos: ProdutosService) {}

  @Post()
  @UseInterceptors(receberImagem())
  create(
    @Body() dto: CreateProdutoDto,
    @CurrentUser() logado: JwtPayload,
    @UploadedFile() imagem?: ArquivoEnviado,
  ) {
    return this.produtos.create(dto, logado.sub, imagem);
  }

  // GET /produtos?categoriaId=1&busca=amigurumi&ordenarPor=preco&direcao=desc
  @Get()
  findAll(
    @Query('categoriaId', new ParseIntPipe({ optional: true }))
    categoriaId?: number,
    @Query('busca') busca?: string,
    @Query('ordenarPor', new ParseEnumPipe(CAMPOS_ORDENACAO, { optional: true }))
    ordenarPor?: CampoOrdenacao,
    @Query('direcao', new ParseEnumPipe(DIRECOES, { optional: true }))
    direcao?: Direcao,
  ) {
    return this.produtos.findAll({ categoriaId, busca, ordenarPor, direcao });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.produtos.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(receberImagem())
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProdutoDto,
    @CurrentUser() logado: JwtPayload,
    @UploadedFile() imagem?: ArquivoEnviado,
  ) {
    return this.produtos.update(id, dto, logado.sub, imagem);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() logado: JwtPayload,
  ) {
    return this.produtos.remove(id, logado.sub);
  }

  @Post(':id/materiais')
  adicionarMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddMaterialDto,
  ) {
    return this.produtos.adicionarMaterial(id, dto);
  }

  @Delete(':id/materiais/:materialId')
  removerMaterial(
    @Param('id', ParseIntPipe) id: number,
    @Param('materialId', ParseIntPipe) materialId: number,
  ) {
    return this.produtos.removerMaterial(id, materialId);
  }
}
