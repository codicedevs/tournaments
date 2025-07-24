import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PhasesService } from './phases.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@Controller('phases')
export class PhasesController {
  constructor(private readonly phasesService: PhasesService) {}

  @Post()
  create(@Body() createPhaseDto: CreatePhaseDto) {
    return this.phasesService.create(createPhaseDto);
  }

  @Get()
  findAll() {
    return this.phasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phasesService.findOne(id);
  }

  @Get('tournament/:tournamentId')
  findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.phasesService.findByTournament(tournamentId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhaseDto: UpdatePhaseDto) {
    return this.phasesService.update(id, updatePhaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phasesService.remove(id);
  }

  @Post(':id/league')
  createLeague(
    @Param('id') id: string,
    @Query('matchDaysAmount') matchDaysAmount: string,
    @Query('isLocalAway') isLocalAway: string,
    @Query('startDate') startDate: string,
    @Query('weekDay') weekDay: string,
  ) {
    return this.phasesService.createLeague(
      id,
      Number(matchDaysAmount),
      isLocalAway === 'true',
      startDate,
      weekDay,
    );
  }

  @Post(':id/fixture')
  generateFixture(
    @Param('id') id: string,
    @Query('isLocalAway') isLocalAway: string,
    @Query('startDate') startDate: string,
    @Query('weekDay') weekDay: string,
  ) {
    return this.phasesService.generateFixture(
      id,
      isLocalAway === 'true',
      startDate,
      weekDay,
    );
  }

  /**
   * Creates the initial round of a knockout tournament
   * @param id Phase ID
   */
  @Post(':id/knockout/create')
  createKnockout(@Param('id') id: string) {
    return this.phasesService.createKnockout(id);
  }

  /**
   * Advances to the next round of a knockout tournament
   * @param id Phase ID
   */
  @Post(':id/knockout/advance')
  advanceKnockoutRound(@Param('id') id: string) {
    return this.phasesService.advanceKnockoutRound(id);
  }

  @Delete(':id/matchdays')
  async deleteMatchdaysByPhase(@Param('id') id: string) {
    return this.phasesService.deleteMatchdaysByPhase(id);
  }
}
