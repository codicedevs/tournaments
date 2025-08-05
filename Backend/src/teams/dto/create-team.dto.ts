import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  coach?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsString()
  referentName: string;

  @IsString()
  @IsOptional()
  referentPhoneNumber?: string;

  @IsString()
  @IsOptional()
  referentEmail?: string;

  @IsString()
  createdById: string;

  @IsString({ each: true })
  @IsOptional()
  players?: string[];

  @IsString()
  @IsOptional()
  captain?: string;
}
