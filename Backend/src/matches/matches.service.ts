import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';
import { Match } from './entities/match.entity';
import { UpdateMatchDto } from './dto/update-match.dto';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<Match>,
  ) {}

  async createMatch(createMatchDto: CreateMatchDto): Promise<Match> {
    const { teamA, teamB, date, homeScore, awayScore, matchDayId } =
      createMatchDto;

    if (!isValidObjectId(teamA) || !isValidObjectId(teamB)) {
      throw new BadRequestException('Invalid team IDs');
    }
    if (teamA === teamB) {
      throw new BadRequestException('A match must involve two different teams');
    }

    // Validar que los scores no sean negativos
    if (homeScore !== undefined && homeScore < 0) {
      throw new BadRequestException('Home score cannot be negative');
    }
    if (awayScore !== undefined && awayScore < 0) {
      throw new BadRequestException('Away score cannot be negative');
    }

    const matchData: any = { teamA, teamB, date, homeScore, awayScore };

    // Add matchDayId if provided
    if (matchDayId && isValidObjectId(matchDayId)) {
      matchData.matchDayId = matchDayId;
    }

    const match = new this.matchModel(matchData);
    return match.save();
  }

  async findAllMatches(): Promise<Match[]> {
    return this.matchModel.find().populate('teamA teamB matchDayId').exec();
  }

  async findMatchesByMatchDay(matchDayId: string): Promise<Match[]> {
    if (!isValidObjectId(matchDayId)) {
      throw new BadRequestException('Invalid matchday ID');
    }
    return this.matchModel
      .find({ matchDayId: new Types.ObjectId(matchDayId) })
      .populate('teamA teamB')
      .exec();
  }

  async findAll(): Promise<Match[]> {
    return this.matchModel.find().exec();
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchModel.findById(id).exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return match;
  }

  async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match> {
    const { homeScore, awayScore } = updateMatchDto;

    // Validar que los scores no sean negativos
    if (homeScore !== undefined && homeScore < 0) {
      throw new BadRequestException('Home score cannot be negative');
    }
    if (awayScore !== undefined && awayScore < 0) {
      throw new BadRequestException('Away score cannot be negative');
    }

    const existingMatch = await this.matchModel
      .findByIdAndUpdate(id, updateMatchDto, { new: true })
      .exec();

    if (!existingMatch) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return existingMatch;
  }
}
