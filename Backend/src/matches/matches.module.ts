import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match, MatchSchema } from './entities/match.entity';
import { Team, TeamSchema } from '../teams/entities/team.entity';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/entities/registration.entity';
import {
  Matchday,
  MatchdaySchema,
} from '../matchdays/entities/matchday.entity';
import { Phase, PhaseSchema } from '../phases/entities/phase.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: Matchday.name, schema: MatchdaySchema },
      { name: Phase.name, schema: PhaseSchema },
    ]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
