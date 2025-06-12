import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { Match } from './entities/match.entity';
import { UpdateMatchDto } from './dto/update-match.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { Team } from '../teams/entities/team.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { Matchday } from '../matchdays/entities/matchday.entity';
import { Phase } from '../phases/entities/phase.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<Match>,
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,
    @InjectModel(Matchday.name) private readonly matchdayModel: Model<Matchday>,
    @InjectModel(Phase.name) private readonly phaseModel: Model<Phase>,
  ) {}

  async createMatch(createMatchDto: CreateMatchDto): Promise<Match> {
    const { teamA, teamB, date, homeScore, awayScore, matchDayId } =
      createMatchDto;

    if (!isValidObjectId(teamA) || !isValidObjectId(teamB)) {
      throw new BadRequestException('Invalid team IDs');
    }
    if (teamA === teamB) {
      throw new BadRequestException('A match must involve two different teams');
    }

    // Validar que los scores no sean negativos
    if (homeScore !== undefined && homeScore < 0) {
      throw new BadRequestException('Home score cannot be negative');
    }
    if (awayScore !== undefined && awayScore < 0) {
      throw new BadRequestException('Away score cannot be negative');
    }

    const matchData: any = { teamA, teamB, date, homeScore, awayScore };

    // Add matchDayId if provided
    if (matchDayId && isValidObjectId(matchDayId)) {
      matchData.matchDayId = matchDayId;
    }

    const match = new this.matchModel(matchData);
    return match.save();
  }

  async findAllMatches(): Promise<Match[]> {
    return this.matchModel.find().populate('teamA teamB matchDayId').exec();
  }

  async findMatchesByMatchDay(matchDayId: string): Promise<Match[]> {
    if (!isValidObjectId(matchDayId)) {
      throw new BadRequestException('Invalid matchday ID');
    }
    return this.matchModel
      .find({ matchDayId: new Types.ObjectId(matchDayId) })
      .populate('teamA teamB')
      .exec();
  }

  async findAll(): Promise<Match[]> {
    return this.matchModel.find().exec();
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchModel.findById(id).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match> {
    const { homeScore, awayScore } = updateMatchDto;

    // Validar que los scores no sean negativos
    if (homeScore !== undefined && homeScore < 0) {
      throw new BadRequestException('Home score cannot be negative');
    }
    if (awayScore !== undefined && awayScore < 0) {
      throw new BadRequestException('Away score cannot be negative');
    }

    const existingMatch = await this.matchModel
      .findByIdAndUpdate(id, updateMatchDto, { new: true })
      .exec();

    if (!existingMatch) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return existingMatch;
  }

  async addEvent(
    id: string,
    event: { type: 'goal'; minute: number; team: 'TeamA' | 'TeamB' },
  ): Promise<Match> {
    const match = await this.findOne(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    // Agregar el evento
    match.events.push(event);
    console.log('match', match);
    // Actualizar los scores basados en los eventos
    const teamAGoals = match.events.filter((e) => e.team === 'TeamA').length;
    const teamBGoals = match.events.filter((e) => e.team === 'TeamB').length;

    match.homeScore = teamAGoals;
    match.awayScore = teamBGoals;

    // Actualizar el resultado
    if (teamAGoals > teamBGoals) {
      match.result = 'TeamA';
    } else if (teamBGoals > teamAGoals) {
      match.result = 'TeamB';
    } else {
      match.result = 'Draw';
    }

    // Actualizar estadísticas de los equipos en sus registros
    if (event.type === 'goal') {
      // Obtener el torneo del matchday
      const matchday = await this.matchdayModel.findById(match.matchDayId);
      if (!matchday) {
        throw new NotFoundException('Matchday not found');
      }
      const phase = await this.phaseModel.findById(matchday.phaseId);
      if (!phase) {
        throw new NotFoundException('Phase not found');
      }
      console.log('match', match);
      const teamAId = match.teamA;

      const tournamentId = phase.tournamentId;

      if (event.team === 'TeamA') {
        // Actualizar registro de TeamA
        const teamAStats = await this.registrationModel.findOneAndUpdate(
          { teamId: teamAId.toString(), tournamentId: tournamentId.toString() },
          {
            $inc: {
              'stats.goalsFor': 1,
              'stats.wins': teamAGoals > teamBGoals ? 1 : 0,
              'stats.draws': teamAGoals === teamBGoals ? 1 : 0,
              'stats.losses': teamAGoals < teamBGoals ? 1 : 0,
            },
          },
        );
        console.log('adentro del if', teamAStats);
        // Actualizar registro de TeamB
        await this.registrationModel.findOneAndUpdate(
          {
            teamId: match.teamB.toString(),
            tournamentId: tournamentId.toString(),
          },
          {
            $inc: {
              'stats.goalsAgainst': 1,
              'stats.wins': teamBGoals > teamAGoals ? 1 : 0,
              'stats.draws': teamBGoals === teamAGoals ? 1 : 0,
              'stats.losses': teamBGoals < teamAGoals ? 1 : 0,
            },
          },
        );
      } else {
        // Actualizar registro de TeamB
        await this.registrationModel.findOneAndUpdate(
          {
            teamId: match.teamB.toString(),
            tournamentId: tournamentId.toString(),
          },
          {
            $inc: {
              'stats.goalsFor': 1,
              'stats.wins': teamBGoals > teamAGoals ? 1 : 0,
              'stats.draws': teamBGoals === teamAGoals ? 1 : 0,
              'stats.losses': teamBGoals < teamAGoals ? 1 : 0,
            },
          },
        );
        // Actualizar registro de TeamA
        await this.registrationModel.findOneAndUpdate(
          {
            teamId: match.teamA.toString(),
            tournamentId: tournamentId.toString(),
          },
          {
            $inc: {
              'stats.goalsAgainst': 1,
              'stats.wins': teamAGoals > teamBGoals ? 1 : 0,
              'stats.draws': teamAGoals === teamBGoals ? 1 : 0,
              'stats.losses': teamAGoals < teamBGoals ? 1 : 0,
            },
          },
        );
      }
    }

    return match.save();
  }
}
