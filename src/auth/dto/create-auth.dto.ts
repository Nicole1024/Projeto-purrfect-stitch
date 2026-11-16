import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {}
export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    nome: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    senha: string;

    sensitiveHeaders: string[];
}
export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    senha: string;
}