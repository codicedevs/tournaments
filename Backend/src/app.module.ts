import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { MatchesModule } from './matches/matches.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { PhasesModule } from './phases/phases.module';
import { MatchdaysModule } from './matchdays/matchdays.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/tournaments'),
    UsersModule,
    TeamsModule,
    MatchesModule,
    TournamentsModule,
    PhasesModule,
    MatchdaysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
