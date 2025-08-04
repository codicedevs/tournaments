import { IsEnum, IsNumber, IsIn, IsString, IsOptional } from 'class-validator';
import { MatchEventType } from '../enums/match-event-type.enum';

export class UpdateMatchEventDto {
  @IsEnum(MatchEventType)
  @IsOptional()
  type?: MatchEventType;

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
