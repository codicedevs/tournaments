import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.entity';
import { Player, PlayerSchema } from '../players/entities/player.entity';
import { PlayersModule } from '../players/players.module';
import { Team, TeamSchema } from '../teams/entities/team.entity';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Player', schema: PlayerSchema },
      { name: 'Team', schema: TeamSchema },
    ]),
    PlayersModule,
    forwardRef(() => TeamsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService to be used in other modules
})
export class UsersModule {}
