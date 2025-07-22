interface Viewer {
  _id: string;
  name: string;
}

interface Referee {
  _id: string;
  name: string;
}

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
  type:
    | "goal"
    | "card"
    | "yellowCard"
    | "redCard"
    | "blueCard"
    | "period"
    | "system"
    | "start_first_half"
    | "end_first_half"
    | "start_second_half"
    | "end_second_half";
  minute: number;
  team?: "TeamA" | "TeamB";
  playerId?: string;
}

// Tipado para populate anidado
interface PopulatedPhase {
  _id: string;
  tournamentId?: { _id: string; name: string } | string;
}

interface PopulatedMatchday {
  _id: string;
  phaseId?: PopulatedPhase | string;
}

export enum MatchStatus {
  UNASSIGNED = "Sin programar",
  SCHEDULED = "Programado",
  IN_PROGRESS = "En juego",
  FINISHED = "Finalizado",
  COMPLETED = "Completado",
}

export interface Match {
  _id: string;
  teamA: Team;
  teamB: Team;
  date: string;
  homeScore: number;
  awayScore: number;
  result: "TeamA" | "TeamB" | "Draw" | null;
  status: MatchStatus;
  matchDayId: string | PopulatedMatchday;
  events: MatchEvent[];
  viewerId?: Viewer;
  refereeId?: Referee;
  fieldNumber?: string;
  category?: string;
  playerMatches?: any[];
}

export interface Team {
  _id: string;
  name: string;
  logo?: string;
  players?: string[];
  coach?: string;
  captain?: string;
}
