export enum MatchResult {
  TEAM_A = "TeamA",
  TEAM_B = "TeamB",
  DRAW = "Draw",
}

export enum MatchEventType {
  GOAL = "goal",
  YELLOW_CARD = "yellowCard",
  RED_CARD = "redCard",
  BLUE_CARD = "blueCard",
}

export interface MatchEvent {
  type: MatchEventType;
  minute: number;
  team: "TeamA" | "TeamB";
  playerId: string;
}

export interface Match {
  _id: string;
  teamA: Team;
  teamB: Team;
  date: string;
  homeScore: number;
  awayScore: number;
  result: "TeamA" | "TeamB" | "Draw" | null;
  completed: boolean;
  matchDayId: string;
  events: MatchEvent[];
}

export interface Team {
  _id: string;
  name: string;
  logo?: string;
}
