import { Team } from "./Team";
import { Tournament } from "./Tournament";

export interface Registration {
  _id: string;
  teamId: string | Team;
  tournamentId: string | Tournament;
  registrationDate: Date;
}

// A version with populated fields
export interface PopulatedRegistration {
  _id: string;
  teamId: Team; // Always populated
  tournamentId: Tournament | string;
  registrationDate: Date;
}
