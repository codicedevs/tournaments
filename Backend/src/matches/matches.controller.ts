import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async createMatch(@Body() createMatchDto: CreateMatchDto): Promise<Match> {
    const { teamA, teamB, date, result, matchDayId } = createMatchDto;
    return this.matchesService.createMatch(
      teamA,
      teamB,
      date,
      result,
      matchDayId,
    );
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
}
