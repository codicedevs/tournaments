import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MatchStatus } from '../enums/match-status.enum';

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
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsMongoId()
  matchDayId?: string;

  @IsOptional()
  @IsMongoId()
  viewerId?: string;

  @IsOptional()
  @IsMongoId()
  refereeId?: string;

  @IsOptional()
  fieldNumber?: string;
}
