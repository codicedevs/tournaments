import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsString({
    message: 'El email o nombre de usuario debe ser una cadena de texto',
  })
  @IsNotEmpty({ message: 'El email o nombre de usuario es requerido' })
  email: string; // Mantenemos el nombre del campo por compatibilidad, pero ahora acepta email o username

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
