import { PhaseType } from '../entities/phase.entity';

export class CreatePhaseDto {
  name: string;
  type?: PhaseType;
  tournamentId: string;
}
