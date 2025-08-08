import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team, TeamDocument } from './entities/team.entity';
import { UsersService } from '../users/users.service';
import { Match } from '../matches/entities/match.entity';
import { Matchday } from '../matchdays/entities/matchday.entity';
import { PlayersService } from 'src/players/players.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Player } from 'src/players/entities/player.entity';
import { Registration } from '../registrations/entities/registration.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<TeamDocument>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly playerService: PlayersService,
    @InjectModel(Match.name) private matchModel: Model<Match>,
    @InjectModel(Matchday.name) private matchdayModel: Model<Matchday>,
    @InjectModel(Player.name) private playerModel: Model<Player>,
    @InjectModel(Registration.name)
    private registrationModel: Model<Registration>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const newTeam = new this.teamModel(createTeamDto);
    return newTeam.save();
  }

  async findAll(shouldPopulate = false): Promise<Team[]> {
    if (shouldPopulate) {
      return this.teamModel
        .find()
        .populate('tournaments')
        .populate({
          path: 'players',
          populate: {
            path: 'userId',
            select: 'name email phone profilePicture role',
          },
        })
        .exec();
    }
    return this.teamModel
      .find()
      .populate({
        path: 'players',
        populate: {
          path: 'userId',
          select: 'name email phone profilePicture role',
        },
      })
      .exec();
  }

  async findOne(id: string, populate: boolean): Promise<Team | null> {
    const query = this.teamModel.findById(id);
    if (populate) {
      query.populate({
        path: 'players',
        populate: {
          path: 'userId',
          select: 'name email phone profilePicture role',
        },
      });
    }
    return query.exec();
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team | null> {
    return this.teamModel
      .findByIdAndUpdate(new Types.ObjectId(id), updateTeamDto, { new: true })
      .populate('createdById')
      .populate({
        path: 'players',
        populate: {
          path: 'userId',
          select: 'name email phone profilePicture role',
        },
      })
      .exec();
  }

  async remove(id: string): Promise<Team | null> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid team ID: ${id}`);
    }

    // Verificar que el equipo existe antes de eliminarlo
    const team = await this.teamModel.findById(id).exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    try {
      // Eliminar todas las registraciones relacionadas con este equipo
      const deletedRegistrations = await this.registrationModel
        .deleteMany({ teamId: id })
        .exec();
      console.log('sdeletedRegistrations', deletedRegistrations);

      // Eliminar el equipo
      const deletedTeam = await this.teamModel.findByIdAndDelete(id).exec();
      console.log('deletedTeam', deletedTeam);

      console.log(`✅ Equipo ${id} eliminado exitosamente`);

      return deletedTeam;
    } catch (error) {
      console.error('❌ Error al eliminar equipo:', error);
      throw new BadRequestException(
        'Error al eliminar el equipo y sus registraciones',
      );
    }
  }

  async addPlayer(teamId: string, userDto: any): Promise<Player> {
    console.log('Agregando jugador al equipo', teamId, userDto);
    if (!isValidObjectId(teamId)) {
      console.log('Invalid team ID', teamId);
      throw new BadRequestException(`Invalid team ID: ${teamId}`);
    }

    // Validar que los campos requeridos estén presentes
    const requiredFields = ['name', 'email', 'password', 'phone'];
    for (const field of requiredFields) {
      if (!userDto[field]) {
        throw new BadRequestException(
          `El campo '${field}' es obligatorio para registrar un jugador.`,
        );
      }
    }

    // Construir el DTO que espera register
    const registerPlayerDto = {
      name: userDto.name,
      email: userDto.email,
      password: userDto.password,
      phone: userDto.phone,
      teamId: new Types.ObjectId(teamId),
    };

    const player = await this.playerService.register(registerPlayerDto);

    // Verificar si el jugador ya está en algún equipo
    const existingTeam = await this.teamModel
      .findOne({ players: player._id })
      .exec();
    if (existingTeam) {
      throw new BadRequestException(
        `Player with ID ${player._id} already belongs to a team`,
      );
    }

    // Agregar el jugador al equipo
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    team.players.push(player._id as Types.ObjectId);
    await team.save();
    return player;
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
      .populate({
        path: 'players',
        populate: {
          path: 'userId',
          select: 'name email phone profilePicture role',
        },
      })
      .exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const playerIndex = team.players.findIndex((player) =>
      new Types.ObjectId(playerId).equals(playerId),
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

  async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    const query: any = {
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    };

    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const team = await this.teamModel.findOne(query);
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

  async getPlayersByTeam(teamId: string) {
    const team = await this.teamModel
      .findById(teamId)
      .populate({
        path: 'players',
        populate: {
          path: 'userId',
          select: 'name email phone profilePicture role',
        },
      })
      .exec();

    if (!team) {
      throw new NotFoundException('Equipo no encontrado');
    }

    // Mapear los jugadores para renombrar userId a user y eliminar userId
    const teamPlayers = team.players.map((player: any) => {
      const playerObj = player.toObject ? player.toObject() : player;
      const { userId, _id, ...rest } = playerObj;
      return {
        playerId: _id,
        ...rest,
        user: userId,
      };
    });

    return teamPlayers;
  }
}
