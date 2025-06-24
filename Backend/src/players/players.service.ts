import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, User } from '../users/entities/user.entity';
import { Player } from './entities/player.entity';
import { RegisterPlayerDto } from './dto/register-player.dto';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<Player>,
    @InjectModel(Team.name) private teamModel: Model<Team>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async register(registerPlayerDto: RegisterPlayerDto): Promise<Player> {
    // Verificar si el equipo existe
    const team = await this.teamModel.findById(registerPlayerDto.teamId).exec();
    if (!team) {
      throw new NotFoundException('Equipo no encontrado');
    }

    // Verificar si el email ya está registrado
    const existingUser = await this.userModel
      .findOne({ email: registerPlayerDto.email })
      .exec();
    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    // Crear el usuario
    const createdUser = new this.userModel({
      name: registerPlayerDto.name,
      email: registerPlayerDto.email,
      password: registerPlayerDto.password,
      phone: registerPlayerDto.phone,
      role: Role.Player,
    });
    const savedUser = await createdUser.save();

    const createdPlayer = new this.playerModel({
      userId: savedUser._id,
      teamId: registerPlayerDto.teamId,
      stats: registerPlayerDto.stats || {
        goals: 0,
        yellowCards: 0,
        blueCards: 0,
        redCards: 0,
        assists: 0,
        matchesPlayed: 0,
      },
    });
    const savedPlayer = await createdPlayer.save();

    // Agregar el jugador al equipo
    team.players.push(savedUser._id as Types.ObjectId);
    await team.save();

    return savedPlayer;
  }

  async findAll(): Promise<Player[]> {
    return this.playerModel.find().populate('userId').populate('teamId').exec();
  }

  async findOne(id: string): Promise<Player> {
    const player = await this.playerModel
      .findById(id)
      .populate('userId')
      .populate('teamId')
      .exec();
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return player;
  }

  async findByUser(userId: string): Promise<Player[]> {
    return this.playerModel
      .find({ userId })
      .populate('userId')
      .populate('teamId')
      .exec();
  }

  async findByTeam(teamId: string): Promise<Player[]> {
    return this.playerModel
      .find({ teamId })
      .populate('userId')
      .populate('teamId')
      .exec();
  }

  async update(
    id: string,
    updatePlayerDto: Partial<RegisterPlayerDto>,
  ): Promise<Player> {
    const player = await this.playerModel
      .findByIdAndUpdate(id, updatePlayerDto, { new: true })
      .populate('userId')
      .populate('teamId')
      .exec();

    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return player;
  }

  async updateStats(
    id: string,
    stats: Partial<Player['stats']>,
  ): Promise<Player> {
    const player = await this.playerModel
      .findByIdAndUpdate(id, { $set: { stats } }, { new: true })
      .populate('userId')
      .populate('teamId')
      .exec();

    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return player;
  }

  async remove(id: string): Promise<void> {
    const result = await this.playerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
  }
}
