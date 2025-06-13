import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchEventDto } from './dto/match-event.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async createMatch(@Body() createMatchDto: CreateMatchDto): Promise<Match> {
    return this.matchesService.createMatch(createMatchDto);
  }

  @Get()
  async findAllMatches(): Promise<Match[]> {
    return this.matchesService.findAllMatches();
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
}
