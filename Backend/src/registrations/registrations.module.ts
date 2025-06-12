import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Registration,
  RegistrationSchema,
} from './entities/registration.entity';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { Phase, PhaseSchema } from '../phases/entities/phase.entity';
import {
  Matchday,
  MatchdaySchema,
} from '../matchdays/entities/matchday.entity';
import { Match, MatchSchema } from '../matches/entities/match.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
      { name: Phase.name, schema: PhaseSchema },
      { name: Matchday.name, schema: MatchdaySchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
