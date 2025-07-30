import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Matchday } from './entities/matchday.entity';
import { CreateMatchdayDto } from './dto/create-matchday.dto';
import { UpdateMatchdayDto } from './dto/update-matchday.dto';

@Injectable()
export class MatchdaysService {
  constructor(
    @InjectModel(Matchday.name) private readonly matchdayModel: Model<Matchday>,
  ) {}

  async create(createMatchdayDto: CreateMatchdayDto): Promise<Matchday> {
    const newMatchday = new this.matchdayModel(createMatchdayDto);
    return newMatchday.save();
  }

  async findAll(): Promise<Matchday[]> {
    return this.matchdayModel.find().populate('phaseId').exec();
  }

  async findOne(id: string): Promise<Matchday | null> {
    return this.matchdayModel.findById(id).populate('phaseId').exec();
  }

  async findOneWithMatches(id: string): Promise<Matchday | null> {
    const matchday = await this.matchdayModel
      .findById(id)
      .populate('phaseId')
      .exec();

    if (!matchday) {
      throw new NotFoundException(`Matchday with ID ${id} not found`);
    }

    // The matches will be fetched via the matches service/controller using the matchday ID
    return matchday;
  }

  async findByPhase(phaseId: string): Promise<Matchday[]> {
    return this.matchdayModel
      .find({ phaseId: new Types.ObjectId(phaseId) })
      .populate('matches')
      .sort({ order: 1 })
      .exec();
  }

  async update(
    id: string,
    updateMatchdayDto: UpdateMatchdayDto,
  ): Promise<Matchday | null> {
    const matchday = await this.matchdayModel.findById(id);
    if (!matchday) {
      throw new NotFoundException(`Matchday with ID ${id} not found`);
    }

    return this.matchdayModel
      .findByIdAndUpdate(id, updateMatchdayDto, { new: true })
      .populate('phaseId')
      .exec();
  }

  async remove(id: string): Promise<Matchday | null> {
    const matchday = await this.matchdayModel.findById(id);
    if (!matchday) {
      throw new NotFoundException(`Matchday with ID ${id} not found`);
    }

    return this.matchdayModel.findByIdAndDelete(id).exec();
  }
}
