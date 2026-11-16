import { IsIn, IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export const NIVEIS_DIFICULDADE = ['Fácil', 'Médio', 'Difícil'] as const;

export class CreateDetalheProdutoDto {
  @IsInt()
  @Min(1, { message: 'O tempo de produção deve ser de pelo menos 1 hora' })
  tempoProducao: number;

  @IsNumber()
  @Min(0)
  peso: number;

  @IsIn(NIVEIS_DIFICULDADE, {
    message: `O nível de dificuldade deve ser: ${NIVEIS_DIFICULDADE.join(', ')}`,
  })
  nivelDificuldade: string;

  @IsString()
  @IsNotEmpty()
  dimensoes: string;
}
