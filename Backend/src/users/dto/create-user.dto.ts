import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  profilePicture?: string;
  @IsString()
  role: string;
}
