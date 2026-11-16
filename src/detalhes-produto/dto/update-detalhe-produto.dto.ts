import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalheProdutoDto } from './create-detalhe-produto.dto.js';

export class UpdateDetalheProdutoDto extends PartialType(CreateDetalheProdutoDto) {}
