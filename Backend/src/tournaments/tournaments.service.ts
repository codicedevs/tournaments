import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tournament } from './entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { Phase, PhaseType } from '../phases/entities/phase.entity';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(Tournament.name)
    private readonly tournamentModel: Model<Tournament>,
    @InjectModel(Phase.name)
    private readonly phaseModel: Model<Phase>,
  ) {}

  async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    // Crear el torneo
    const newTournament = new this.tournamentModel(createTournamentDto);
    const savedTournament = await newTournament.save();

    // Crear automáticamente una fase de tipo LEAGUE
    const newPhase = new this.phaseModel({
      name: 'Fase de Liga',
      type: PhaseType.LEAGUE,
      tournamentId: savedTournament._id,
    });

    const savedPhase = await newPhase.save();

    // Actualizar el torneo para incluir la fase creada
    await this.tournamentModel.findByIdAndUpdate(
      savedTournament._id,
      { $push: { phases: savedPhase._id } },
      { new: true },
    );

    // Retornar el torneo con la fase populada
    const tournamentWithPhases = await this.tournamentModel
      .findById(savedTournament._id)
      .populate('phases')
      .exec();

    if (!tournamentWithPhases) {
      throw new Error('Error al crear el torneo');
    }

    return tournamentWithPhases;
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournamentModel.find().populate('phases').exec();
  }

  async findOne(id: string): Promise<Tournament | null> {
    return this.tournamentModel.findById(id).populate('phases').exec();
  }

  async update(
    id: string,
    updateTournamentDto: UpdateTournamentDto,
  ): Promise<Tournament | null> {
    return this.tournamentModel
      .findByIdAndUpdate(id, updateTournamentDto, { new: true })
      .populate('phases')
      .exec();
  }

  async remove(id: string): Promise<Tournament | null> {
    return this.tournamentModel.findByIdAndDelete(id).exec();
  }
}
