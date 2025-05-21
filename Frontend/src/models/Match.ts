import { Team } from "./Team";
import { Matchday } from "./Matchday";

export enum MatchResult {
  HOME_TEAM = "Home",
  AWAY_TEAM = "Away",
  DRAW = "Draw",
}

export enum MatchState {
  SCHEDULED = "Scheduled",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
}

export interface Match {
  _id: string;
  home: Team;
  away: Team;
  date: Date;
  result?: MatchResult;
  scoreHome?: number;
  scoreAway?: number;
  state: MatchState;
  matchDayId?: string | Matchday;
  location?: string;
}
