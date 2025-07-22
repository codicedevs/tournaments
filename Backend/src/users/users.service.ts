import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { Player } from '../players/entities/player.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const newUser = new this.userModel(createUserDto);
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

  async remove(id: string): Promise<UserDocument | null> {
    // Elimina el Player asociado si existe
    await this.playerModel.deleteOne({ userId: id }).exec();
    // Elimina el usuario
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async createUserWithPlayer(createUserDto: CreateUserDto) {
    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      // 1. Crear el usuario
      const user = await this.userModel.create([createUserDto], { session });
      const createdUser = user[0];

      // 2. Si el rol es Player, crear el player asociado
      let player = null;
      if (createUserDto.role === 'Player') {
        const playerArr = await this.playerModel.create(
          [{ userId: createdUser._id }],
          { session },
        );
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
