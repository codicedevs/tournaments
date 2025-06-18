import {
  IsMongoId,
  IsOptional,
  IsNumber,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsNotEmpty,
} from 'class-validator';
import { Types } from 'mongoose';

export class StatsDto {
  @IsNumber()
  @IsOptional()
  goals: number;

  @IsNumber()
  @IsOptional()
  yellowCards: number;

  @IsNumber()
  @IsOptional()
  blueCards: number;

  @IsNumber()
  @IsOptional()
  redCards: number;

  @IsNumber()
  @IsOptional()
  assists: number;

  @IsNumber()
  @IsOptional()
  matchesPlayed: number;
}

export class RegisterPlayerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  phone: string;

  @IsMongoId()
  @IsNotEmpty()
  teamId: Types.ObjectId;

  @IsOptional()
  stats?: StatsDto;
}
