import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Match } from './entities/match.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<Match>,
  ) {}

  async createMatch(
    teamA: string,
    teamB: string,
    date: Date,
    result: 'TeamA' | 'TeamB' | 'Draw',
    matchDayId?: string,
  ): Promise<Match> {
    if (!isValidObjectId(teamA) || !isValidObjectId(teamB)) {
      throw new BadRequestException('Invalid team IDs');
    }
    if (teamA === teamB) {
      throw new BadRequestException('A match must involve two different teams');
    }

    const matchData: any = { teamA, teamB, date, result };

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
    return this.matchModel.find({ matchDayId }).populate('teamA teamB').exec();
  }
}
