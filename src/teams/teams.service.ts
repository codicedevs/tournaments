import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    private readonly usersService: UsersService,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const newTeam = new this.teamModel(createTeamDto);
    return newTeam.save();
  }

  async findAll(populate: boolean): Promise<Team[]> {
    const query = this.teamModel.find();
    if (populate) {
      query.populate('players');
    }
    return query.exec();
  }

  async findOne(id: string, populate: boolean): Promise<Team | null> {
    const query = this.teamModel.findById(id);
    if (populate) {
      query.populate('players');
    }
    return query.exec();
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team | null> {
    return this.teamModel
      .findByIdAndUpdate(id, updateTeamDto, { new: true })
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
}
