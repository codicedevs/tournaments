import { Team } from "./Team";
import { Matchday } from "./Matchday";

export enum MatchResult {
  TEAM_A = "TeamA",
  TEAM_B = "TeamB",
  DRAW = "Draw",
}

export interface Match {
  _id: string;
  teamA: string | Team;
  teamB: string | Team;
  date: Date;
  result?: MatchResult;
  matchDayId?: string | Matchday;
  location?: string;
}
