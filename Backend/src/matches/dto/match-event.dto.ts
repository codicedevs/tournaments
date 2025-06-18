import { IsEnum, IsNumber, IsIn, IsMongoId } from 'class-validator';
import { MatchEventType } from '../enums/match-event-type.enum';

export class MatchEventDto {
  @IsEnum(MatchEventType)
  type: MatchEventType;

  @IsNumber()
  minute: number;

  @IsIn(['TeamA', 'TeamB'])
  team: 'TeamA' | 'TeamB';

  @IsMongoId()
  playerId: string;
}
