import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Phase } from './entities/phase.entity';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@Injectable()
export class PhasesService {
  constructor(
    @InjectModel(Phase.name) private readonly phaseModel: Model<Phase>,
  ) {}

  async create(createPhaseDto: CreatePhaseDto): Promise<Phase> {
    const newPhase = new this.phaseModel(createPhaseDto);
    return newPhase.save();
  }

  async findAll(): Promise<Phase[]> {
    return this.phaseModel.find().populate('tournamentId').exec();
  }

  async findOne(id: string): Promise<Phase | null> {
    return this.phaseModel.findById(id).populate('tournamentId').exec();
  }

  async findByTournament(tournamentId: string): Promise<Phase[]> {
    return this.phaseModel.find({ tournamentId }).exec();
  }

  async update(
    id: string,
    updatePhaseDto: UpdatePhaseDto,
  ): Promise<Phase | null> {
    const phase = await this.phaseModel.findById(id);
    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} not found`);
    }

    return this.phaseModel
      .findByIdAndUpdate(id, updatePhaseDto, { new: true })
      .populate('tournamentId')
      .exec();
  }

  async remove(id: string): Promise<Phase | null> {
    const phase = await this.phaseModel.findById(id);
    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} not found`);
    }

    return this.phaseModel.findByIdAndDelete(id).exec();
  }
}
