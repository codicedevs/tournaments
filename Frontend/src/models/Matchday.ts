import { Match } from "./Match";
import { Phase } from "./Phase";

export interface Matchday {
  _id: string;
  order: number;
  date?: Date;
  phaseId: string | Phase;
  matches?: Match[];
}
