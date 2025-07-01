import { IsEnum, IsNumber, IsIn, IsMongoId } from 'class-validator';
import { MatchEventType } from '../enums/match-event-type.enum';
import { Types } from 'mongoose';

export class MatchEventDto {
  @IsEnum(MatchEventType)
  type: MatchEventType;

  @IsNumber()
  minute: number;

  @IsIn(['TeamA', 'TeamB'])
  team: 'TeamA' | 'TeamB';

  @IsMongoId()
  playerId: Types.ObjectId;

  timestamp?: Date;
}
