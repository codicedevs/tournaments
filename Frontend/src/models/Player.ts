import { User } from "./User";

export interface PlayerStats {
  goals: number;
  yellowCards: number;
  blueCards: number;
  redCards: number;
  assists: number;
  matchesPlayed: number;
}

export interface Player {
  _id: string;
  userId: string | User;
  stats: PlayerStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface PopulatedPlayer extends Omit<Player, "userId"> {
  userId: User;
}
