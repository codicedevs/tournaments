import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Team, TeamSchema } from './entities/team.entity';
import { UsersModule } from '../users/users.module';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    UsersModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {}
