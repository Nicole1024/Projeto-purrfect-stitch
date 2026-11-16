import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsInt()
  @Min(0, { message: 'A quantidade em estoque não pode ser negativa' })
  quantidade: number;

  @IsString()
  @IsNotEmpty()
  unidadeMedida: string;
}
