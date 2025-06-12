import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team, TeamDocument } from './entities/team.entity';
import { UsersService } from '../users/users.service';
import { Match } from '../matches/entities/match.entity';
import { Matchday } from '../matchdays/entities/matchday.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<TeamDocument>,
    private readonly usersService: UsersService,
    @InjectModel(Match.name) private matchModel: Model<Match>,
    @InjectModel(Matchday.name) private matchdayModel: Model<Matchday>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const newTeam = new this.teamModel(createTeamDto);
    return newTeam.save();
  }

  async findAll(shouldPopulate = false): Promise<Team[]> {
    if (shouldPopulate) {
      return this.teamModel.find().populate('tournaments').exec();
    }
    return this.teamModel.find().exec();
  }

  async findOne(id: string, populate: boolean): Promise<Team | null> {
    const query = this.teamModel.findById(id);
    if (populate) {
      query.populate('players');
    }
    return query.exec();
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team | null> {
    console.log('Update team with ID:', id, updateTeamDto);
    return this.teamModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateTeamDto, { new: true })
      .populate('createdById players')
      .exec();
  }

  async remove(id: string): Promise<Team | null> {
    return this.teamModel.findByIdAndDelete(id).exec();
  }

  async addPlayer(teamId: string, playerId: string): Promise<Team> {
    if (!isValidObjectId(teamId)) {
      throw new BadRequestException(`Invalid team ID: ${teamId}`);
    }
    if (!isValidObjectId(playerId)) {
      throw new BadRequestException(`Invalid player ID: ${playerId}`);
    }

    const team = await this.teamModel
      .findById(teamId)
      .populate('players')
      .exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const player = await this.usersService.findOne(playerId);
    if (!player) {
      throw new NotFoundException(`Player with ID ${playerId} not found`);
    }

    const existingTeam = await this.teamModel
      .findOne({ players: playerId })
      .exec();
    if (existingTeam) {
      throw new BadRequestException(
        `Player with ID ${playerId} already belongs to a team`,
      );
    }

    team.players.push(new Types.ObjectId(playerId));
    console.log('Team after adding player:', team);
    return team.save();
  }

  async removePlayer(teamId: string, playerId: string): Promise<Team> {
    if (!isValidObjectId(teamId)) {
      throw new BadRequestException(`Invalid team ID: ${teamId}`);
    }
    if (!isValidObjectId(playerId)) {
      throw new BadRequestException(`Invalid player ID: ${playerId}`);
    }

    const team = await this.teamModel
      .findById(teamId)
      .populate('players')
      .exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const playerIndex = team.players.findIndex((player) =>
      (player._id as Types.ObjectId).equals(playerId),
    );
    if (playerIndex === -1) {
      throw new BadRequestException(
        `Player with ID ${playerId} does not belong to this team`,
      );
    }

    team.players.splice(playerIndex, 1);
    return team.save();
  }

  async findByUser(userId: string): Promise<Team[]> {
    return this.teamModel
      .find({ createdById: new Types.ObjectId(userId) })
      .exec();
  }

  async checkNameExists(name: string): Promise<boolean> {
    console.log('entro');
    const team = await this.teamModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    return !!team;
  }

  async getTeamsByPhase(phaseId: string) {
    // Primero obtener todos los matchdays de la fase
    const matchdays = await this.matchdayModel.find({ phaseId });
    const matchdayIds = matchdays.map((matchday) => matchday._id);

    // Obtener todos los partidos de la fase
    const matches = await this.matchModel
      .find({
        matchDayId: { $in: matchdayIds },
      })
      .populate('teamA teamB');

    // Obtener todos los equipos únicos que participan en la fase
    const teamIds = new Set();
    matches.forEach((match) => {
      teamIds.add(match.teamA.toString());
      teamIds.add(match.teamB.toString());
    });

    // Obtener los equipos con sus estadísticas
    const teams = await this.teamModel.find({
      _id: { $in: Array.from(teamIds) },
    });

    return teams;
  }
}
