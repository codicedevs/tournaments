import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  create(@Body() createRegistrationDto: CreateRegistrationDto) {
    return this.registrationsService.create(createRegistrationDto);
  }

  @Get()
  findAll() {
    return this.registrationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  @Get('tournament/:tournamentId')
  findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.registrationsService.findByTournament(tournamentId);
  }

  @Get('team/:teamId')
  findByTeam(@Param('teamId') teamId: string) {
    return this.registrationsService.findByTeam(teamId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegistrationDto: UpdateRegistrationDto) {
    return this.registrationsService.update(id, updateRegistrationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.registrationsService.remove(id);
  }
}
