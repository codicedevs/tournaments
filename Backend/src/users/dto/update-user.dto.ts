import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { Role } from '../entities/user.entity';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  username?: string;

  @IsOptional()
  @IsString({ message: 'El DNI debe ser una cadena de texto' })
  dni?: string;

  @IsOptional()
  @ValidateIf(
    (o) =>
      o.birthDate !== undefined && o.birthDate !== null && o.birthDate !== '',
  )
  @IsDateString(
    {},
    { message: 'La fecha de nacimiento debe ser una fecha válida' },
  )
  birthDate?: string;

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
  @IsEnum(Role, { message: 'El rol debe ser uno de los valores válidos' })
  role?: Role;

  @IsOptional()
  @IsString({ message: 'El ID del equipo debe ser una cadena de texto' })
  teamId?: string;

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
