import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { RegisterPlayerDto } from './dto/register-player.dto';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  register(@Body() registerPlayerDto: RegisterPlayerDto, @Request() req) {
    return this.playersService.register(registerPlayerDto);
  }

  @Get()
  findAll() {
    return this.playersService.findAll();
  }

  @Get('my-players')
  findMyPlayers(@Request() req) {
    return this.playersService.findByUser(req.user.id);
  }

  @Get('by-user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.playersService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }

  @Get('by-tournament/:tournamentId')
  async findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.playersService.findPlayersByTournament(tournamentId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlayerDto: Partial<RegisterPlayerDto>,
  ) {
    return this.playersService.update(id, updatePlayerDto);
  }

  @Patch(':id/stats')
  updateStats(@Param('id') id: string, @Body() stats: any) {
    return this.playersService.updateStats(id, stats);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playersService.remove(id);
  }
}
