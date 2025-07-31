import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { User, UserDocument } from './entities/user.entity';
import { Player } from '../players/entities/player.entity';
import { PlayersService } from '../players/players.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
    private readonly playersService: PlayersService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Validar que al menos email o username esté presente
    if (!createUserDto.email && !createUserDto.username) {
      throw new Error(
        'Debe proporcionar al menos un email o nombre de usuario',
      );
    }

    // Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
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
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Validar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      updatePasswordDto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Validar que las contraseñas coincidan
    if (updatePasswordDto.newPassword !== updatePasswordDto.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
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
      throw new Error('Usuario no encontrado');
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
      throw new Error(
        'Debe proporcionar al menos un email o nombre de usuario',
      );
    }

    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      // Hashear la contraseña antes de crear el usuario
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // 1. Crear el usuario
      const user = await this.userModel.create(
        [
          {
            ...createUserDto,
            password: hashedPassword,
          },
        ],
        { session },
      );
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
