import { Team } from "./Team";
import { Tournament } from "./Tournament";

export interface TeamStats {
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  yellowCards: number;
  blueCards: number;
  redCards: number;
}

export interface Registration {
  _id: string;
  teamId: string | Team;
  tournamentId: string | Tournament;
  registrationDate: Date;
  stats: TeamStats;
}

// A version with populated fields
export interface PopulatedRegistration {
  _id: string;
  teamId: Team; // Always populated
  tournamentId: Tournament | string;
  registrationDate: Date;
  stats: TeamStats;
}
