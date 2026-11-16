import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// Este DTO também recebe multipart/form-data (envio de imagem), onde todo valor
// chega como texto. O @Type(() => Number) converte antes da validação.
export class CreateProdutoDto {
  @Type(() => Number)
  @IsInt()
  categoriaId: number;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'O preço deve ser maior que zero' })
  preco: number;

  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'A quantidade em estoque não pode ser negativa' })
  quantidade: number;
}
