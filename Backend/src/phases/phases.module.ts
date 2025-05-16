import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Phase, PhaseSchema } from './entities/phase.entity';
import { PhasesService } from './phases.service';
import { PhasesController } from './phases.controller';
import {
  Matchday,
  MatchdaySchema,
} from '../matchdays/entities/matchday.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Phase.name, schema: PhaseSchema },
      { name: Matchday.name, schema: MatchdaySchema },
    ]),
  ],
  controllers: [PhasesController],
  providers: [PhasesService],
  exports: [PhasesService],
})
export class PhasesModule {}
