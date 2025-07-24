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
import { Registration } from '../registrations/entities/registration.entity';

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

    if (player.teamId !== updatePlayerDto.teamId) {
      const team = await this.teamModel.findById(updatePlayerDto.teamId).exec();
      if (team) {
        team.players.push(player._id as Types.ObjectId);
        await team.save();
      }
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

  async removeFromTeam(id: string): Promise<void> {
    const player = await this.playerModel
      .findById(id)
      .populate('teamId')
      .exec();
    if (!player) throw new NotFoundException(`Player with ID ${id} not found`);

    const team = player.teamId?._id
      ? await this.teamModel.findById(player.teamId._id).exec()
      : null;
    if (!team)
      throw new NotFoundException(`Team with ID ${player.teamId} not found`);

    player.teamId = null;
    team.players = team.players.filter((player) => player.toString() !== id);

    await player.save();
    await team.save();
  }

  async findPlayersByTournament(tournamentId: string): Promise<Player[]> {
    // 1. Buscar los equipos registrados en el torneo
    const registrations = await this.teamModel.db
      .model('Registration')
      .find({ tournamentId });
    const teamIds = registrations.map((reg: any) => reg.teamId);

    // 2. Buscar los jugadores de esos equipos y ordenar por goles
    return this.playerModel
      .find({ teamId: { $in: teamIds } })
      .populate('userId')
      .populate('teamId')
      .sort({ 'stats.goals': -1 })
      .exec();
  }

  async createPlayerByUser(userId: string, teamId?: string): Promise<Player> {
    // Validar que el usuario existe y es rol Player

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      console.log('Usuario no encontrado', userId);
      throw new NotFoundException('Usuario no encontrado');
    }
    if (user.role !== Role.Player) {
      throw new BadRequestException('El usuario no tiene rol Player');
    }

    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      console.log('Equipo no encontrado', teamId);
      throw new NotFoundException('Equipo no encontrado');
    }

    // Validar que no exista ya un Player para ese userId
    const existingPlayer = await this.playerModel.findOne({ userId }).exec();
    if (existingPlayer) {
      throw new BadRequestException('Ya existe un Player para este usuario');
    }
    // Crear Player
    const createdPlayer = new this.playerModel({
      userId: user._id,
      teamId: teamId || null,
      stats: {
        goals: 0,
        yellowCards: 0,
        blueCards: 0,
        redCards: 0,
        assists: 0,
        matchesPlayed: 0,
      },
    });
    team.players.push(user._id as Types.ObjectId);
    await team.save();

    return createdPlayer.save();
  }
}
