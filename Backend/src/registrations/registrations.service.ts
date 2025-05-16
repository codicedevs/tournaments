import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Registration } from './entities/registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,
  ) {}

  async create(
    createRegistrationDto: CreateRegistrationDto,
  ): Promise<Registration> {
    // Check if registration already exists
    const existingRegistration = await this.registrationModel.findOne({
      teamId: createRegistrationDto.teamId,
      tournamentId: createRegistrationDto.tournamentId,
    });

    if (existingRegistration) {
      throw new ConflictException(
        'Team is already registered for this tournament',
      );
    }

    const newRegistration = new this.registrationModel(createRegistrationDto);
    return newRegistration.save();
  }

  async findAll(): Promise<Registration[]> {
    return this.registrationModel.find().populate('teamId tournamentId').exec();
  }

  async findOne(id: string): Promise<Registration | null> {
    return this.registrationModel
      .findById(id)
      .populate('teamId tournamentId')
      .exec();
  }

  async findByTournament(tournamentId: string): Promise<Registration[]> {
    return this.registrationModel
      .find({ tournamentId })
      .populate('teamId')
      .exec();
  }

  async findByTeam(teamId: string): Promise<Registration[]> {
    return this.registrationModel
      .find({ teamId })
      .populate('tournamentId')
      .exec();
  }

  async update(
    id: string,
    updateRegistrationDto: UpdateRegistrationDto,
  ): Promise<Registration | null> {
    const registration = await this.registrationModel.findById(id);
    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    return this.registrationModel
      .findByIdAndUpdate(id, updateRegistrationDto, { new: true })
      .populate('teamId tournamentId')
      .exec();
  }

  async remove(id: string): Promise<Registration | null> {
    const registration = await this.registrationModel.findById(id);
    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    return this.registrationModel.findByIdAndDelete(id).exec();
  }
}
