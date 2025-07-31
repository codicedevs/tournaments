import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Team, TeamSchema } from './entities/team.entity';
import { UsersModule } from '../users/users.module';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { MatchesModule } from 'src/matches/matches.module';
import { Match, MatchSchema } from 'src/matches/entities/match.entity';
import {
  Matchday,
  MatchdaySchema,
} from 'src/matchdays/entities/matchday.entity';
import { Player, PlayerSchema } from 'src/players/entities/player.entity';
import { PlayersModule } from 'src/players/players.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Match.name, schema: MatchSchema },
      { name: Matchday.name, schema: MatchdaySchema },
      { name: Player.name, schema: PlayerSchema },
    ]),
    forwardRef(() => UsersModule),
    PlayersModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
