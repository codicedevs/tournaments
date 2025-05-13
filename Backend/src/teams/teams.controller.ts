import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  findAll(@Query('populate') populate: string) {
    const shouldPopulate = populate === 'true';
    return this.teamsService.findAll(shouldPopulate);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('populate') populate: string) {
    const shouldPopulate = populate === 'true';
    return this.teamsService.findOne(id, shouldPopulate);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }

  @Post(':id/players/:playerId')
  addPlayer(@Param('id') teamId: string, @Param('playerId') playerId: string) {
    return this.teamsService.addPlayer(teamId, playerId);
  }

  @Delete(':id/players/:playerId')
  removePlayer(
    @Param('id') teamId: string,
    @Param('playerId') playerId: string,
  ) {
    return this.teamsService.removePlayer(teamId, playerId);
  }
}
