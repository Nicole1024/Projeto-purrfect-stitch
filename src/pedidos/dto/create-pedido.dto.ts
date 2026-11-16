import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ItemPedidoDto {
  @IsInt()
  produtoId: number;

  @IsInt()
  @Min(1, { message: 'A quantidade de cada item deve ser de pelo menos 1' })
  quantidade: number;
}

export class CreatePedidoDto {
  @IsString()
  @IsNotEmpty()
  clienteNome: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'O pedido precisa ter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  itens: ItemPedidoDto[];
}
