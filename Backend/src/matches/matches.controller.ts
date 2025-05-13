import { Controller, Post, Get, Body } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async createMatch(@Body() createMatchDto: CreateMatchDto): Promise<Match> {
    const { teamA, teamB, date, result } = createMatchDto;
    return this.matchesService.createMatch(teamA, teamB, date, result);
  }

  @Get()
  async findAllMatches(): Promise<Match[]> {
    return this.matchesService.findAllMatches();
  }
}
