import {
  IsEnum,
  IsNumber,
  IsIn,
  IsMongoId,
  isString,
  IsString,
  IsOptional,
} from 'class-validator';
import { MatchEventType } from '../enums/match-event-type.enum';
import { Types } from 'mongoose';

//TODO Chequear porque el MatchEventDto me da error cuando le mando desde el addEvent

export class MatchEventDto {
  @IsEnum(MatchEventType)
  type: MatchEventType;

  @IsNumber()
  @IsOptional()
  minute?: number;

  @IsIn(['TeamA', 'TeamB'])
  @IsOptional()
  team?: 'TeamA' | 'TeamB';

  @IsString()
  @IsOptional()
  playerId?: string;
}
