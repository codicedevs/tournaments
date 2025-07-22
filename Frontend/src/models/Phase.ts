import { Tournament } from "./Tournament";
import { Matchday } from "./Matchday";

export enum PhaseType {
  GROUP = "GROUP",
  KNOCKOUT = "KNOCKOUT",
  LEAGUE = "LEAGUE",
  FINAL = "FINAL",
  QUALIFYING = "QUALIFYING",
}

export interface Phase {
  _id: string;
  name: string;
  type: PhaseType;
  tournamentId: string | Tournament;
  matchdays?: Matchday[];
  createdAt?: string;
}
