import { IsInt, Min } from 'class-validator';

export class AddMaterialDto {
  @IsInt()
  materialId: number;

  @IsInt()
  @Min(1, { message: 'A quantidade usada deve ser de pelo menos 1' })
  quantidadeUsada: number;
}
