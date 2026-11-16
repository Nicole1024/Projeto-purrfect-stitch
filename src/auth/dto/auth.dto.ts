import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

const normalizarEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @Transform(normalizarEmail)
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;
}

export class LoginDto {
  @Transform(normalizarEmail)
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  senha: string;
}
