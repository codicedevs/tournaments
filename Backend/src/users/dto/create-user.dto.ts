import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;

  @IsEnum(Role, { message: 'El rol debe ser uno de los valores válidos' })
  role: Role;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La imagen de perfil debe ser una cadena de texto' })
  profilePicture?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string;

  @IsOptional()
  @IsBoolean({ message: 'isVerified debe ser un valor booleano' })
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'mustChangePassword debe ser un valor booleano' })
  mustChangePassword?: boolean;
}
