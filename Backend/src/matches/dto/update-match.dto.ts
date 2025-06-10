import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMatchDto {
  @IsOptional()
  @IsMongoId()
  teamA?: string;

  @IsOptional()
  @IsMongoId()
  teamB?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  homeScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  awayScore?: number;

  @IsOptional()
  @IsEnum(['TeamA', 'TeamB', 'Draw'])
  result?: 'TeamA' | 'TeamB' | 'Draw';

  @IsOptional()
  @IsMongoId()
  matchDayId?: string;

  @IsOptional()
  completed?: boolean;
}
