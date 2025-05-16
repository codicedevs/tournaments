import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Phase } from './entities/phase.entity';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { Matchday } from '../matchdays/entities/matchday.entity';

@Injectable()
export class PhasesService {
  constructor(
    @InjectModel(Phase.name) private readonly phaseModel: Model<Phase>,
    @InjectModel(Matchday.name) private readonly matchdayModel: Model<Matchday>,
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

  /**
   * Creates match days for a league phase
   * @param phaseId ID of the phase to create match days for
   * @param matchDaysAmount Number of match days to create
   * @param isLocalAway If true, creates double match days for home and away matches
   * @returns Array of created match days
   */
  async createLeague(
    phaseId: string,
    matchDaysAmount: number,
    isLocalAway: boolean,
  ): Promise<Matchday[]> {
    // Verify phase exists
    const phase = await this.phaseModel.findById(phaseId);
    if (!phase) {
      throw new NotFoundException(`Phase with ID ${phaseId} not found`);
    }

    const totalMatchDays = isLocalAway ? matchDaysAmount * 2 : matchDaysAmount;
    const createdMatchDays: Matchday[] = [];

    for (let i = 1; i <= totalMatchDays; i++) {
      const matchDay = new this.matchdayModel({
        order: i,
        phaseId: new Types.ObjectId(phaseId),
        // No date is set, it will be defined later
      });

      const savedMatchDay = await matchDay.save();
      createdMatchDays.push(savedMatchDay);
    }

    return createdMatchDays;
  }

  async remove(id: string): Promise<Phase | null> {
    const phase = await this.phaseModel.findById(id);
    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} not found`);
    }

    return this.phaseModel.findByIdAndDelete(id).exec();
  }
}
