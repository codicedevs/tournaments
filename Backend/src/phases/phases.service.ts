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

    // Create a copy of teams for rotation
    const teamsCopy = [...adjustedTeams];
    // Remove the first team which will stay fixed
    const fixedTeam = teamsCopy.shift();

    for (let round = 0; round < rounds; round++) {
      const roundMatches: Array<[any, any]> = [];

      // Fixed team plays against rotating team
      if (fixedTeam !== null && teamsCopy[round % teamsCopy.length] !== null) {
        if (round % 2 === 0) {
          roundMatches.push([fixedTeam, teamsCopy[round % teamsCopy.length]]);
        } else {
          roundMatches.push([teamsCopy[round % teamsCopy.length], fixedTeam]);
        }
      }

      // Create matches for the rest of the teams
      for (let i = 0; i < matchesPerRound - 1; i++) {
        const team1Index = (round + i) % teamsCopy.length;
        const team2Index =
          (round + teamsCopy.length - 1 - i) % teamsCopy.length;

        if (teamsCopy[team1Index] !== null && teamsCopy[team2Index] !== null) {
          roundMatches.push([teamsCopy[team1Index], teamsCopy[team2Index]]);
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
          });

          const savedMatch = await match.save();
          createdMatches.push(savedMatch);
        }
      }
    }

    return { matchDays: createdMatchDays, matches: createdMatches };
  }

  async remove(id: string): Promise<Phase | null> {
    const phase = await this.phaseModel.findById(id);
    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} not found`);
    }

    return this.phaseModel.findByIdAndDelete(id).exec();
  }
}
