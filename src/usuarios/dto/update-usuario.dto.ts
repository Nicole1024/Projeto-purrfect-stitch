import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto.js';

// Todos os campos opcionais: senha em branco = manter a senha atual.
export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
