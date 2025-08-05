import {
  Injectable,
  Inject,
  forwardRef,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User, UserDocument } from './entities/user.entity';
import { Player } from '../players/entities/player.entity';
import { Team, TeamDocument } from '../teams/entities/team.entity';
import { PlayersService } from '../players/players.service';
import { TeamsService } from '../teams/teams.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
    @InjectModel(Team.name) private readonly teamModel: Model<TeamDocument>,
    private readonly playersService: PlayersService,
    @Inject(forwardRef(() => TeamsService))
    private readonly teamsService: TeamsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Validar que al menos email o username esté presente
    if (!createUserDto.email && !createUserDto.username) {
      throw new BadRequestException(
        'Debe proporcionar al menos un email o nombre de usuario',
      );
    }

    // Validar que el DNI sea único si se proporciona
    if (createUserDto.dni) {
      const existingUser = await this.userModel
        .findOne({ dni: createUserDto.dni })
        .exec();
      if (existingUser) {
        throw new ConflictException('El DNI ya está registrado en el sistema');
      }
    }

    // Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Procesar el DNI: si es string vacío, convertirlo a null
    const userData = {
      ...createUserDto,
      password: hashedPassword,
      dni:
        createUserDto.dni && createUserDto.dni.trim() !== ''
          ? createUserDto.dni
          : null,
    };

    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    // Obtener el usuario actual para comparar el rol
    const currentUser = await this.userModel.findById(id).exec();
    if (!currentUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar que el DNI sea único si se está actualizando
    if (updateUserDto.dni && updateUserDto.dni !== currentUser.dni) {
      const existingUser = await this.userModel
        .findOne({
          dni: updateUserDto.dni,
          _id: { $ne: id }, // Excluir el usuario actual
        })
        .exec();
      if (existingUser) {
        throw new ConflictException('El DNI ya está registrado en el sistema');
      }
    }

    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      // Verificar si hay cambio de rol
      const isRoleChanging =
        updateUserDto.role && updateUserDto.role !== currentUser.role;
      const isBecomingPlayer =
        isRoleChanging && updateUserDto.role === 'Player';
      const isStoppingBeingPlayer =
        isRoleChanging && currentUser.role === 'Player';

      // Si se está convirtiendo en Player
      if (isBecomingPlayer) {
        // Verificar si ya existe un player para este usuario
        const existingPlayer = await this.playerModel
          .findOne({ userId: id })
          .exec();
        if (!existingPlayer) {
          // Crear un nuevo player
          const playerData: any = { userId: id };
          if (updateUserDto.teamId) {
            playerData.teamId = updateUserDto.teamId;
          }
          const playerArr = await this.playerModel.create([playerData], {
            session,
          });
          const newPlayer = playerArr[0];

          // Si se especificó un teamId, agregar el jugador al array players del equipo
          if (updateUserDto.teamId && newPlayer) {
            const team = await this.teamModel
              .findById(updateUserDto.teamId)
              .session(session)
              .exec();
            if (!team) {
              throw new NotFoundException(
                `Equipo con ID ${updateUserDto.teamId} no encontrado`,
              );
            }

            // Verificar si el jugador ya está en el equipo
            const playerExists = team.players.some(
              (p) => p.toString() === (newPlayer as any)._id.toString(),
            );
            if (!playerExists) {
              team.players.push((newPlayer as any)._id);
              await team.save({ session });
            }
          }
        } else if (updateUserDto.teamId) {
          // Si el player ya existe pero se está asignando a un equipo
          const team = await this.teamModel
            .findById(updateUserDto.teamId)
            .session(session)
            .exec();
          if (!team) {
            throw new NotFoundException(
              `Equipo con ID ${updateUserDto.teamId} no encontrado`,
            );
          }

          // Verificar si el jugador ya está en el equipo
          const playerExists = team.players.some(
            (p) => p.toString() === (existingPlayer as any)._id.toString(),
          );
          if (!playerExists) {
            team.players.push((existingPlayer as any)._id);
            await team.save({ session });
          }

          // Actualizar el teamId del player
          await this.playerModel.findByIdAndUpdate(
            existingPlayer._id,
            { teamId: updateUserDto.teamId },
            { session },
          );
        }
      }

      // Si está dejando de ser Player
      if (isStoppingBeingPlayer) {
        // Buscar el player asociado
        const existingPlayer = await this.playerModel
          .findOne({ userId: id })
          .exec();
        if (existingPlayer) {
          // Remover el player de todos los equipos donde esté
          const teams = await this.teamModel
            .find({
              players: (existingPlayer as any)._id,
            })
            .session(session)
            .exec();

          for (const team of teams) {
            team.players = team.players.filter(
              (p) => p.toString() !== (existingPlayer as any)._id.toString(),
            );
            await team.save({ session });
          }

          // Actualizar el player para remover el teamId
          await this.playerModel.findByIdAndUpdate(
            existingPlayer._id,
            { $unset: { teamId: 1 } },
            { session },
          );
        }
      }

      // Procesar el DNI: si es string vacío, convertirlo a null
      const updateData = {
        ...updateUserDto,
        dni:
          updateUserDto.dni && updateUserDto.dni.trim() !== ''
            ? updateUserDto.dni
            : null,
      };

      // Actualizar el usuario
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true, session })
        .exec();

      await session.commitTransaction();
      session.endSession();

      return updatedUser;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Validar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Validar que las contraseñas coincidan
    if (updatePasswordDto.newPassword !== updatePasswordDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

    // Actualizar el usuario
    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      lastPasswordChange: new Date(),
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  async remove(id: string): Promise<UserDocument | null> {
    // Buscar el usuario para verificar su rol
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si es Player, usar el servicio de players para eliminar correctamente
    if (user.role === 'Player') {
      const player = await this.playerModel.findOne({ userId: id }).exec();
      console.log('player', player);
      if (player) {
        // Esto elimina el player y lo quita del equipo
        await this.playersService.remove((player as any)._id.toString());
      }
    } else {
      // Para otros roles, solo eliminar el player asociado si existe
      await this.playerModel.deleteOne({ userId: id }).exec();
    }

    // Eliminar el usuario
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async createUserWithPlayer(
    createUserDto: CreateUserDto & { teamId?: string },
  ) {
    // Validar que al menos email o username esté presente
    if (!createUserDto.email && !createUserDto.username) {
      throw new BadRequestException(
        'Debe proporcionar al menos un email o nombre de usuario',
      );
    }

    // Validar que el DNI sea único si se proporciona
    if (createUserDto.dni) {
      const existingUser = await this.userModel
        .findOne({ dni: createUserDto.dni })
        .exec();
      if (existingUser) {
        throw new ConflictException('El DNI ya está registrado en el sistema');
      }
    }

    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      // Hashear la contraseña antes de crear el usuario
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Procesar el DNI: si es string vacío, convertirlo a null
      const userData = {
        ...createUserDto,
        password: hashedPassword,
        dni:
          createUserDto.dni && createUserDto.dni.trim() !== ''
            ? createUserDto.dni
            : null,
      };

      // 1. Crear el usuario
      const user = await this.userModel.create([userData], { session });
      const createdUser = user[0];

      // 2. Si el rol es Player, crear el player asociado
      let player: Player | null = null;
      if (createUserDto.role === 'Player') {
        const playerData: any = { userId: createdUser._id };
        if (createUserDto.teamId) playerData.teamId = createUserDto.teamId;
        const playerArr = await this.playerModel.create([playerData], {
          session,
        });
        player = playerArr[0];

        // 3. Si se especificó un teamId, agregar el jugador al array players del equipo
        if (createUserDto.teamId && player) {
          // Obtener el equipo y agregar el jugador al array players
          const team = await this.teamModel
            .findById(createUserDto.teamId)
            .session(session)
            .exec();
          if (!team) {
            throw new NotFoundException(
              `Equipo con ID ${createUserDto.teamId} no encontrado`,
            );
          }

          // Verificar si el jugador ya está en el equipo
          const playerExists = team.players.some(
            (p) => p.toString() === (player as any)._id.toString(),
          );
          if (!playerExists) {
            team.players.push((player as any)._id);
            await team.save({ session });
          }
        }
      }

      await session.commitTransaction();
      session.endSession();

      return {
        user: createdUser,
        player: player ? player : null,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
