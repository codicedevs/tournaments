import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  BadRequestException,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchEventDto } from './dto/match-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MatchObservations } from './entities/match.entity';

@Controller('matches')
export class MatchesController {
  constructor(
    private readonly matchesService: MatchesService,
    @InjectModel(MatchObservations.name)
    private readonly matchObservationsModel: Model<MatchObservations>,
  ) {}

  @Post()
  async createMatch(@Body() createMatchDto: CreateMatchDto): Promise<Match> {
    return this.matchesService.createMatch(createMatchDto);
  }

  @Get()
  async findAllMatches(
    @Query() filter: Record<string, string>,
  ): Promise<Match[]> {
    return this.matchesService.findAll(filter);
  }

  @Get('matchday/:matchDayId')
  async findMatchesByMatchDay(
    @Param('matchDayId') matchDayId: string,
  ): Promise<Match[]> {
    return this.matchesService.findMatchesByMatchDay(matchDayId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Match> {
    return this.matchesService.findOne(id);
  }

  @Get(':id/tournament-details')
  getMatchTournamentDetails(@Param('id') id: string): Promise<any> {
    return this.matchesService.getMatchTournamentDetails(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ): Promise<Match> {
    // Validar que si se envían ambos scores, sean números válidos
    if (
      (updateMatchDto.homeScore !== undefined &&
        updateMatchDto.awayScore === undefined) ||
      (updateMatchDto.homeScore === undefined &&
        updateMatchDto.awayScore !== undefined)
    ) {
      throw new BadRequestException(
        'Debe proporcionar ambos scores para actualizar el resultado',
      );
    }

    // Si se proporcionan ambos scores, calcular el resultado
    if (
      updateMatchDto.homeScore !== undefined &&
      updateMatchDto.awayScore !== undefined
    ) {
      if (updateMatchDto.homeScore > updateMatchDto.awayScore) {
        updateMatchDto.result = 'TeamA';
      } else if (updateMatchDto.homeScore < updateMatchDto.awayScore) {
        updateMatchDto.result = 'TeamB';
      } else {
        updateMatchDto.result = 'Draw';
      }
    }

    return this.matchesService.update(id, updateMatchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matchesService.remove(id);
  }

  @Post(':id/events')
  async addEvent(
    @Param('id') id: string,
    @Body() event: MatchEventDto,
  ): Promise<Match> {
    return this.matchesService.addEvent(id, event);
  }

  @Post(':id/complete')
  completeMatch(@Param('id') id: string) {
    return this.matchesService.completeMatch(id);
  }

  @Patch(':id/player-matches')
  async updatePlayerMatches(
    @Param('id') id: string,
    @Body('playerMatches') playerMatches: any[],
  ): Promise<Match> {
    return this.matchesService.updatePlayerMatches(id, playerMatches);
  }

  // Observaciones del partido
  @Get(':matchId/observations')
  async getObservations(@Param('matchId') matchId: string) {
    const obs = await this.matchObservationsModel.findOne({
      matchId: new Types.ObjectId(matchId),
    });
    if (!obs) throw new NotFoundException('Observations not found');
    return obs;
  }

  @Post(':matchId/observations')
  async createObservations(
    @Param('matchId') matchId: string,
    @Body() body: any,
  ) {
    // body: { complaints, refereeEvaluation, redCardReport }
    const created = new this.matchObservationsModel({ ...body, matchId });
    return created.save();
  }

  @Patch(':matchId/observations')
  async updateObservations(
    @Param('matchId') matchId: string,
    @Body() body: any,
  ) {
    const updated = await this.matchObservationsModel.findOneAndUpdate(
      { matchId: new Types.ObjectId(matchId) },
      body,
      { new: true, upsert: true },
    );
    return updated;
  }
}
