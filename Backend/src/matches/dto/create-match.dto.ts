import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';
import { MatchStatus } from '../enums/match-status.enum';

export class CreateMatchDto {
  @IsMongoId()
  teamA: string;

  @IsMongoId()
  teamB: string;

  @IsDate()
  date: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  homeScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  awayScore?: number;

  @IsOptional()
  @IsEnum(['TeamA', 'TeamB', 'Draw'])
  result?: 'TeamA' | 'TeamB' | 'Draw';

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsMongoId()
  matchDayId?: string;
}
