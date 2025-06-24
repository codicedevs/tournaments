import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Generate the file URL based on your server configuration
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/uploads/${file.filename}`;

    return {
      originalName: file.originalname,
      filename: file.filename,
      url,
    };
  }
  @Get('check-name')
  async checkNameExists(@Query('name') name: string) {
    console.log('Checking team name:', name);
    if (!name || name.length < 3) {
      return { exists: false };
    }

    const exists = await this.teamsService.checkNameExists(name);
    return { exists };
  }

  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  async findAll(): Promise<Team[]> {
    return this.teamsService.findAll();
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

  @Post(':id/addPlayersToTeam')
  addPlayer(@Param('id') teamId: string, @Body() playerData: any) {
    return this.teamsService.addPlayer(teamId, playerData);
  }

  @Delete(':id/players/:playerId')
  removePlayer(
    @Param('id') teamId: string,
    @Param('playerId') playerId: string,
  ) {
    return this.teamsService.removePlayer(teamId, playerId);
  }

  @Get('phase/:phaseId')
  async getTeamsByPhase(@Param('phaseId') phaseId: string) {
    return this.teamsService.getTeamsByPhase(phaseId);
  }

  @Get(':id/players')
  async getPlayersByTeam(@Param('id') teamId: string) {
    return this.teamsService.getPlayersByTeam(teamId);
  }
}
