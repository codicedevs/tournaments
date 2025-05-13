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
  ): Promise<Match> {
    if (!isValidObjectId(teamA) || !isValidObjectId(teamB)) {
      throw new BadRequestException('Invalid team IDs');
    }
    if (teamA === teamB) {
      throw new BadRequestException('A match must involve two different teams');
    }

    const match = new this.matchModel({ teamA, teamB, date, result });
    return match.save();
  }

  async findAllMatches(): Promise<Match[]> {
    return this.matchModel.find().populate('teamA teamB').exec();
  }
}
