import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StatusPedido } from '../../generated/prisma/client.js';

// Só o cliente e o status podem mudar depois que o pedido é criado.
// (Os itens não mudam, porque o estoque já foi baixado.)
export class UpdatePedidoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clienteNome?: string;

  @IsOptional()
  @IsEnum(StatusPedido)
  status?: StatusPedido;
}
