import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Registration } from './entities/registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { Phase } from '../phases/entities/phase.entity';
import { Matchday } from '../matchdays/entities/matchday.entity';
import { Match } from '../matches/entities/match.entity';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,
    @InjectModel(Phase.name)
    private readonly phaseModel: Model<Phase>,
    @InjectModel(Matchday.name)
    private readonly matchdayModel: Model<Matchday>,
    @InjectModel(Match.name)
    private readonly matchModel: Model<Match>,
  ) {}

  async create(
    createRegistrationDto: CreateRegistrationDto,
  ): Promise<Registration> {
    // Check if registration already exists for this tournament
    const existingRegistration = await this.registrationModel.findOne({
      teamId: createRegistrationDto.teamId,
      tournamentId: createRegistrationDto.tournamentId,
    });

    if (existingRegistration) {
      throw new ConflictException(
        'Team is already registered for this tournament',
      );
    }

    // Check if team is registered in any other tournament
    const existingTeamRegistration = await this.registrationModel.findOne({
      teamId: createRegistrationDto.teamId,
    });

    if (existingTeamRegistration) {
      throw new ConflictException(
        'Team is already registered in another tournament',
      );
    }

    const newRegistration = new this.registrationModel(createRegistrationDto);
    return newRegistration.save();
  }

  async findAll(): Promise<Registration[]> {
    return this.registrationModel.find().populate('teamId tournamentId').exec();
  }

  async findOne(id: string): Promise<Registration | null> {
    return this.registrationModel
      .findById(id)
      .populate('teamId tournamentId')
      .exec();
  }

  async findByTournament(tournamentId: string): Promise<Registration[]> {
    const res = await this.registrationModel
      .find({ tournamentId })
      .sort({ 'stats.scoreWeight': -1 })
      .populate({
        path: 'teamId',
        populate: {
          path: 'players',
          populate: {
            path: 'userId',
          },
        },
      })
      .exec();
    return res;
  }

  async findByTeam(teamId: string): Promise<Registration[]> {
    return this.registrationModel
      .find({ teamId: teamId })
      .populate('tournamentId')
      .exec();
  }

  async update(
    id: string,
    updateRegistrationDto: UpdateRegistrationDto,
  ): Promise<Registration | null> {
    const registration = await this.registrationModel.findById(id);
    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    return this.registrationModel
      .findByIdAndUpdate(id, updateRegistrationDto, { new: true })
      .populate('teamId tournamentId')
      .exec();
  }

  async remove(id: string): Promise<Registration | null> {
    const registration = await this.registrationModel.findById(id);
    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    return this.registrationModel.findByIdAndDelete(id).exec();
  }

  async resetStats(tournamentId: string): Promise<void> {
    // Resetear estadísticas de los registros
    await this.registrationModel.updateMany(
      { tournamentId },
      {
        $set: {
          'stats.wins': 0,
          'stats.points': 0,
          'stats.gamesPlayed': 0,
          'stats.draws': 0,
          'stats.losses': 0,
          'stats.goalsFor': 0,
          'stats.goalsAgainst': 0,
          'stats.yellowCards': 0,
          'stats.redCards': 0,
          'stats.blueCards': 0,
          'stats.goals': [0],
          'stats.fairPlayScore': 0,
          'stats.goalDifference': 0,
          'stats.scoreWeight': 0,
        },
      },
    );

    // Obtener todas las fases del torneo
    const phases = await this.phaseModel.find({ tournamentId });
    const phaseIds = phases.map((phase) => phase._id);

    // Obtener todos los matchdays de las fases
    const matchdays = await this.matchdayModel.find({
      phaseId: { $in: phaseIds },
    });
    const matchdayIds = matchdays.map((matchday) => matchday._id);

    // Resetear todos los partidos
    await this.matchModel.updateMany(
      { matchDayId: { $in: matchdayIds } },
      {
        $set: {
          homeScore: 0,
          awayScore: 0,
          result: null,
          events: [],
        },
      },
    );
  }
}
