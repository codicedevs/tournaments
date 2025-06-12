import { Team } from "./Team";
import { Matchday } from "./Matchday";

export enum MatchResult {
  TEAM_A = "TeamA",
  TEAM_B = "TeamB",
  DRAW = "Draw",
}

export interface MatchEvent {
  type: "goal";
  minute: number;
  team: "TeamA" | "TeamB";
}

export interface Match {
  _id: string;
  teamA: Team;
  teamB: Team;
  date: Date;
  homeScore: number | null;
  awayScore: number | null;
  result: "TeamA" | "TeamB" | "Draw" | null;
  matchDayId: string;
  completed: boolean;
  events: MatchEvent[];
  location?: string;
}
