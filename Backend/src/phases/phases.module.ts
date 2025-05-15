import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Phase, PhaseSchema } from './entities/phase.entity';
import { PhasesService } from './phases.service';
import { PhasesController } from './phases.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Phase.name, schema: PhaseSchema }]),
  ],
  controllers: [PhasesController],
  providers: [PhasesService],
  exports: [PhasesService],
})
export class PhasesModule {}
