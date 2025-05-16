import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Matchday, MatchdaySchema } from './entities/matchday.entity';
import { MatchdaysService } from './matchdays.service';
import { MatchdaysController } from './matchdays.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Matchday.name, schema: MatchdaySchema },
    ]),
  ],
  controllers: [MatchdaysController],
  providers: [MatchdaysService],
  exports: [MatchdaysService],
})
export class MatchdaysModule {}
