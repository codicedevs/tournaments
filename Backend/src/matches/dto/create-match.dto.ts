import { MatchResult } from '../entities/match.entity';

export class CreateMatchDto {
  home: string;
  away: string;
  date: Date;
  result: MatchResult;
  matchDayId?: string;
}
