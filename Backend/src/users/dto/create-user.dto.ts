import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateIf,
} from 'class-validator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  username?: string;

  @ValidateIf((o) => !o.email && !o.username)
  @IsString({
    message: 'Debe proporcionar al menos un email o nombre de usuario',
  })
  _emailOrUsername?: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;

  @IsEnum(Role, { message: 'El rol debe ser uno de los valores válidos' })
  role: Role;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @IsOptional()
  @IsString({ message: 'El DNI debe ser una cadena de texto' })
  dni?: string;

  @IsOptional()
  @IsString({ message: 'La ocupación debe ser una cadena de texto' })
  occupation?: string;

  @IsOptional()
  @IsString({ message: 'La obra social debe ser una cadena de texto' })
  healthInsurance?: string;

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
  @IsBoolean({ message: 'isBlacklisted debe ser un valor booleano' })
  isBlacklisted?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'mustChangePassword debe ser un valor booleano' })
  mustChangePassword?: boolean;

  @IsOptional()
  @IsArray({ message: 'pdfs debe ser un array' })
  @IsString({
    each: true,
    message: 'Cada elemento de pdfs debe ser una cadena de texto',
  })
  pdfs?: string[];
}
