import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Phase } from './entities/phase.entity';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { Matchday } from '../matchdays/entities/matchday.entity';
import { Match } from '../matches/entities/match.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { Team } from 'src/teams/entities/team.entity';
import { MatchStatus } from '../matches/enums/match-status.enum';

@Injectable()
export class PhasesService {
  constructor(
    @InjectModel(Phase.name) private readonly phaseModel: Model<Phase>,
    @InjectModel(Matchday.name) private readonly matchdayModel: Model<Matchday>,
    @InjectModel(Match.name) private readonly matchModel: Model<Match>,
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,
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
   * Generates a complete league fixture for teams registered in a tournament
   */
  async generateFixture(
    phaseId: string,
    isLocalAway: boolean,
  ): Promise<{ matchDays: Matchday[]; matches: Match[] }> {
    // Find the phase
    const phase = await this.phaseModel.findById(phaseId);
    if (!phase) {
      throw new NotFoundException(`Phase with ID ${phaseId} not found`);
    }

    // Get all teams registered for the tournament
    const registrations = await this.registrationModel
      .find({
        tournamentId: phase.tournamentId,
      })
      .populate('teamId')
      .exec();

    if (registrations.length < 2) {
      throw new BadRequestException(
        'Not enough teams registered to generate fixtures (minimum 2)',
      );
    }

    // Find all existing matchdays for this phase
    const existingMatchdays = await this.matchdayModel
      .find({
        phaseId: new Types.ObjectId(phaseId),
      })
      .exec();

    // Delete all matches associated with these matchdays
    for (const matchday of existingMatchdays) {
      await this.matchModel
        .deleteMany({
          matchDayId: matchday._id,
        })
        .exec();
    }

    // Delete all matchdays for this phase
    await this.matchdayModel
      .deleteMany({
        phaseId: new Types.ObjectId(phaseId),
      })
      .exec();

    // Extract teams from registrations
    const teams = registrations.map((reg) => reg.teamId);

    // Generate round-robin schedule
    const schedule = this.generateRoundRobinSchedule(teams);

    // Create match days and matches
    const result = await this.createMatchDaysAndMatches(
      phaseId,
      schedule,
      isLocalAway,
    );

    return result;
  }

  /**
   * Creates league match days structure without matches
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

    // Input validation
    if (matchDaysAmount < 1) {
      throw new BadRequestException('Match days amount must be at least 1');
    }

    // Find all existing matchdays for this phase
    const existingMatchdays = await this.matchdayModel
      .find({
        phaseId: new Types.ObjectId(phaseId),
      })
      .exec();

    // Delete all matches associated with these matchdays
    for (const matchday of existingMatchdays) {
      await this.matchModel
        .deleteMany({
          matchDayId: matchday._id,
        })
        .exec();
    }

    // Delete all matchdays for this phase
    await this.matchdayModel
      .deleteMany({
        phaseId: new Types.ObjectId(phaseId),
      })
      .exec();

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

  /**
   * Generates a round-robin tournament schedule
   */
  private generateRoundRobinSchedule(teams: any[]): Array<Array<[Team, Team]>> {
    const teamCount = teams.length;

    // If odd number of teams, add a dummy team (represents a "bye")
    const isDummyTeamNeeded = teamCount % 2 !== 0;
    const adjustedTeams = [...teams];
    if (isDummyTeamNeeded) {
      adjustedTeams.push(null); // Dummy team
    }

    const rounds = adjustedTeams.length - 1;
    const matchesPerRound = adjustedTeams.length / 2;
    const schedule: Array<Array<[Team, Team]>> = [];

    for (let round = 0; round < rounds; round++) {
      const roundMatches: Array<[any, any]> = [];
      for (let i = 0; i < matchesPerRound; i++) {
        const homeIdx = (round + i) % (adjustedTeams.length - 1);
        let awayIdx =
          (adjustedTeams.length - 1 - i + round) % (adjustedTeams.length - 1);
        if (i === 0) awayIdx = adjustedTeams.length - 1;
        const homeTeam = adjustedTeams[homeIdx];
        const awayTeam = adjustedTeams[awayIdx];
        // No partido si hay bye
        if (homeTeam && awayTeam) {
          roundMatches.push([homeTeam, awayTeam]);
        }
      }
      schedule.push(roundMatches);
    }
    return schedule;
  }

  /**
   * Creates match days and matches from a schedule
   */
  private async createMatchDaysAndMatches(
    phaseId: string,
    schedule: Array<Array<[any, any]>>,
    isLocalAway: boolean,
  ): Promise<{ matchDays: Matchday[]; matches: Match[] }> {
    const createdMatchDays: Matchday[] = [];
    const createdMatches: Match[] = [];

    // First round (home matches)
    for (let round = 0; round < schedule.length; round++) {
      const matchDay = new this.matchdayModel({
        order: round + 1, // Order starts at 1 and increases
        phaseId: new Types.ObjectId(phaseId),
        // Date to be set later
      });

      const savedMatchDay = await matchDay.save();
      createdMatchDays.push(savedMatchDay);

      // Create matches for this round
      for (const [homeTeam, awayTeam] of schedule[round]) {
        const match = new this.matchModel({
          teamA: homeTeam._id,
          teamB: awayTeam._id,
          date: new Date(), // Default date, to be updated later
          matchDayId: savedMatchDay._id,
          status: MatchStatus.UNASSIGNED,
        });

        const savedMatch = await match.save();
        createdMatches.push(savedMatch);
      }
    }

    // If local-away format, create second round (away matches) with continuing order numbers
    if (isLocalAway) {
      // Start order numbering where the first round ended
      const startOrder = schedule.length + 1;

      for (let round = 0; round < schedule.length; round++) {
        const matchDay = new this.matchdayModel({
          order: startOrder + round, // Continue numbering from where home matches ended
          phaseId: new Types.ObjectId(phaseId),
          // Date to be set later
        });

        const savedMatchDay = await matchDay.save();
        createdMatchDays.push(savedMatchDay);

        // Create matches with reversed home/away teams
        for (const [homeTeam, awayTeam] of schedule[round]) {
          const match = new this.matchModel({
            teamA: awayTeam._id, // Now away team is home
            teamB: homeTeam._id, // Now home team is away
            date: new Date(), // Default date, to be updated later
            matchDayId: savedMatchDay._id,
            status: MatchStatus.UNASSIGNED,
          });

          const savedMatch = await match.save();
          createdMatches.push(savedMatch);
        }
      }
    }

    return { matchDays: createdMatchDays, matches: createdMatches };
  }

  /**
   * Creates the first round of a knockout tournament
   */
  async createKnockout(
    phaseId: string,
  ): Promise<{ matchday: Matchday; matches: Match[] }> {
    // Find the phase
    const phase = await this.phaseModel.findById(phaseId);
    if (!phase) {
      throw new NotFoundException(`Phase with ID ${phaseId} not found`);
    }

    // Get all teams registered for the tournament
    const registrations = await this.registrationModel
      .find({
        tournamentId: phase.tournamentId,
      })
      .populate('teamId')
      .exec();

    if (registrations.length < 2) {
      throw new BadRequestException(
        'Not enough teams registered to create a knockout tournament (minimum 2)',
      );
    }

    // Extract teams from registrations
    const teams = registrations.map((reg) => reg.teamId);

    // Shuffle teams randomly
    const shuffledTeams = this.shuffleArray([...teams]);

    // Delete existing matchdays and matches for this phase (if any)
    const existingMatchdays = await this.matchdayModel
      .find({
        phaseId: new Types.ObjectId(phaseId),
      })
      .exec();

    for (const matchday of existingMatchdays) {
      await this.matchModel
        .deleteMany({
          matchDayId: matchday._id,
        })
        .exec();
    }

    await this.matchdayModel
      .deleteMany({
        phaseId: new Types.ObjectId(phaseId),
      })
      .exec();

    // Create a new matchday with order=1
    const matchday = new this.matchdayModel({
      order: 1,
      phaseId: new Types.ObjectId(phaseId),
      name: `Round of ${shuffledTeams.length}`,
    });
    const savedMatchday = await matchday.save();

    // Create matches for the first round
    const matches: Match[] = [];
    const pairCount = Math.floor(shuffledTeams.length / 2);

    for (let i = 0; i < pairCount; i++) {
      const match = new this.matchModel({
        teamA: shuffledTeams[i * 2]._id,
        teamB: shuffledTeams[i * 2 + 1]._id,
        date: new Date(), // Default date, can be updated later
        matchDayId: savedMatchday._id,
        status: MatchStatus.UNASSIGNED,
      });

      const savedMatch = await match.save();
      matches.push(savedMatch);
    }

    // If odd number of teams, the last team gets a bye
    if (shuffledTeams.length % 2 !== 0) {
      const byeTeam = shuffledTeams[shuffledTeams.length - 1];
      // Create a match with a bye (null opponent)
      const byeMatch = new this.matchModel({
        teamA: byeTeam._id,
        teamB: null, // No opponent (bye)
        date: new Date(),
        matchDayId: savedMatchday._id,
        status: MatchStatus.COMPLETED,
        result: 'TeamA', // Team with bye automatically advances
      });

      const savedByeMatch = await byeMatch.save();
      matches.push(savedByeMatch);
    }

    return {
      matchday: savedMatchday,
      matches: matches,
    };
  }

  /**
   * Advances to the next round of a knockout tournament
   */
  async advanceKnockoutRound(
    phaseId: string,
  ): Promise<{ matchday: Matchday; matches: Match[] }> {
    // Find the phase
    const phase = await this.phaseModel.findById(phaseId);
    if (!phase) {
      throw new NotFoundException(`Phase with ID ${phaseId} not found`);
    }

    // Find the latest matchday in this phase
    const latestMatchday = await this.matchdayModel
      .findOne({
        phaseId: new Types.ObjectId(phaseId),
      })
      .sort({ order: -1 })
      .exec();

    if (!latestMatchday) {
      throw new NotFoundException(`No matchdays found for phase ${phaseId}`);
    }

    // Get all matches from the latest matchday
    const matches = await this.matchModel
      .find({
        matchDayId: latestMatchday._id,
      })
      .exec();

    if (matches.length === 0) {
      throw new BadRequestException('No matches found in the current round');
    }

    // Check if all matches have results
    const incompleteMatches = matches.filter(
      (match) => match.status !== MatchStatus.COMPLETED || !match.result,
    );
    if (incompleteMatches.length > 0) {
      throw new BadRequestException(
        'Todos los partidos deben estar completados antes de avanzar a la siguiente ronda',
      );
    }

    // Collect winners from previous round
    const winners: Types.ObjectId[] = [];
    for (const match of matches) {
      if (match.result === 'TeamA') {
        winners.push(match.teamA);
      } else if (match.result === 'TeamB') {
        winners.push(match.teamB);
      } else {
        throw new BadRequestException('Knockout matches cannot end in a draw');
      }
    }

    // Check if we have a winner (tournament completed)
    if (winners.length <= 1) {
      throw new BadRequestException(
        'El torneo ya está completado con un ganador',
      );
    }

    // Create a new matchday for the next round
    const newMatchday = new this.matchdayModel({
      order: latestMatchday.order + 1,
      phaseId: new Types.ObjectId(phaseId),
      name: this.getKnockoutRoundName(winners.length),
    });
    const savedMatchday = await newMatchday.save();

    // Create new matches by pairing winners
    const newMatches: Match[] = [];
    const pairCount = Math.floor(winners.length / 2);

    for (let i = 0; i < pairCount; i++) {
      const match = new this.matchModel({
        teamA: winners[i * 2],
        teamB: winners[i * 2 + 1],
        date: new Date(), // Default date, can be updated later
        matchDayId: savedMatchday._id,
        status: MatchStatus.UNASSIGNED,
      });

      const savedMatch = await match.save();
      newMatches.push(savedMatch);
    }

    // If odd number of winners, one gets a bye
    if (winners.length % 2 !== 0) {
      const byeTeam = winners[winners.length - 1];
      // Create a match with a bye (null opponent)
      const byeMatch = new this.matchModel({
        teamA: byeTeam,
        teamB: null, // No opponent (bye)
        date: new Date(),
        matchDayId: savedMatchday._id,
        status: MatchStatus.COMPLETED,
        result: 'TeamA', // Team with bye automatically advances
      });

      const savedByeMatch = await byeMatch.save();
      newMatches.push(savedByeMatch);
    }

    return {
      matchday: savedMatchday,
      matches: newMatches,
    };
  }

  /**
   * Helper method to get round name based on number of teams
   */
  private getKnockoutRoundName(teamsCount: number): string {
    switch (teamsCount) {
      case 2:
        return 'Final';
      case 4:
        return 'Semi-finals';
      case 8:
        return 'Quarter-finals';
      case 16:
        return 'Round of 16';
      case 32:
        return 'Round of 32';
      default:
        return `Round of ${teamsCount}`;
    }
  }

  /**
   * Helper method to shuffle an array (Fisher-Yates algorithm)
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async remove(id: string): Promise<Phase | null> {
    const phase = await this.phaseModel.findById(id);
    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} not found`);
    }

    return this.phaseModel.findByIdAndDelete(id).exec();
  }
}
