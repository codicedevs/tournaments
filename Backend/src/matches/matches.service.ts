import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, isValidObjectId, Types } from 'mongoose';
import { Match } from './entities/match.entity';
import { UpdateMatchDto } from './dto/update-match.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { Team } from '../teams/entities/team.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { Matchday } from '../matchdays/entities/matchday.entity';
import { Phase } from '../phases/entities/phase.entity';
import { MatchEventType } from './enums/match-event-type.enum';
import { MatchEventDto } from './dto/match-event.dto';
import { Player } from '../players/entities/player.entity';
import { MatchStatus } from './enums/match-status.enum';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(Match.name) private readonly matchModel: Model<Match>,
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(Registration.name)
    private readonly registrationModel: Model<Registration>,
    @InjectModel(Matchday.name) private readonly matchdayModel: Model<Matchday>,
    @InjectModel(Phase.name) private readonly phaseModel: Model<Phase>,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
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

  async findMatchesByMatchDay(matchDayId: string): Promise<Match[]> {
    if (!isValidObjectId(matchDayId)) {
      throw new BadRequestException('Invalid matchday ID');
    }
    const res = await this.matchModel
      .find({ matchDayId: new Types.ObjectId(matchDayId) })
      .populate('teamA teamB')
      .exec();
    console.log('res', res);
    return res;
  }

  async findAll(filter: Record<string, string>): Promise<Match[]> {
    return this.matchModel
      .find(filter)
      .populate({
        path: 'teamA teamB',
      })
      .populate({
        path: 'matchDayId',
        populate: {
          path: 'phaseId',
          populate: {
            path: 'tournamentId',
          },
        },
      })
      .exec();
  }

  async getMatchTournamentDetails(id: string): Promise<any> {
    const match = await this.matchModel.findById(id).lean().exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    // Obtener los IDs relacionados
    const matchDayId = match.matchDayId;
    let phaseId = new Types.ObjectId();
    let tournamentId = new Types.ObjectId();
    if (matchDayId) {
      const matchday = await this.matchdayModel.findById(matchDayId).lean();
      if (matchday && matchday.phaseId) {
        phaseId = matchday.phaseId;
        const phase = await this.phaseModel.findById(phaseId).lean();
        if (phase && phase.tournamentId) {
          tournamentId = phase.tournamentId;
        }
      }
    }
    return {
      matchId: match._id?.toString?.() ?? match._id,
      matchDayId: matchDayId?.toString?.() ?? matchDayId,
      phaseId: phaseId
        ? typeof phaseId === 'string'
          ? phaseId
          : phaseId
        : undefined,
      tournamentId: tournamentId
        ? typeof tournamentId === 'string'
          ? tournamentId
          : tournamentId
        : undefined,
    };
  }

  async findOne(id: string): Promise<any> {
    const match = await this.matchModel
      .findById(id)
      .populate('teamA')
      .populate('teamB')
      .populate({ path: 'viewerId', select: 'name' })
      .populate({ path: 'refereeId', select: 'name' })
      .lean()
      .exec();

    // populate manual
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    if (match.events && match.events.some((event) => event.playerId)) {
      const playerIds = match.events
        .map((event) => event.playerId)
        .filter((id) => id != null);

      const players = await this.playerModel
        .find({ _id: { $in: playerIds } })
        .populate({
          path: 'userId',
          select: 'name', // Solo traigo el nombre del usuario
        })
        .select('userId') // Solo traigo el userId en el player
        .lean();

      const playersWithName = players.map((player) => ({
        _id: player._id,
        name: player.userId?.name || null,
      }));

      const playersMap = new Map(
        playersWithName.map((p) => [p._id.toString(), p]),
      );

      match.events = match.events.map((event) => ({
        ...event,
        player: event.playerId
          ? (playersMap.get(event.playerId?.toString()) ?? null)
          : null,
      }));
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

  async addEvent(id: string, event: MatchEventDto): Promise<Match> {
    const systemEvents = [
      'start_first_half',
      'end_first_half',
      'start_second_half',
      'end_second_half',
    ];
    if (systemEvents.includes(event.type)) {
      return this.addSystemEvent(id, event);
    } else {
      return this.addMatchEvent(id, event);
    }
  }

  async addSystemEvent(id: string, event: MatchEventDto): Promise<Match> {
    const match = await this.matchModel
      .findById(id)
      .populate('teamA')
      .populate('teamB')
      .exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    if (match.status === MatchStatus.COMPLETED) {
      throw new BadRequestException('Cannot add events to a completed match');
    }
    if (!match.events) {
      match.events = [];
    }
    match.events.push({
      type: event.type,
      minute: event.minute ?? 0,
      timestamp: new Date(),
    });
    // Cambiar status según el tipo de evento
    if (event.type === MatchEventType.START_FIRST_HALF) {
      match.status = MatchStatus.IN_PROGRESS;
    }
    if (event.type === MatchEventType.END_SECOND_HALF) {
      match.status = MatchStatus.FINISHED;
    }
    return match.save();
  }

  async addMatchEvent(id: string, event: MatchEventDto): Promise<Match> {
    const match = await this.matchModel
      .findById(id)
      .populate('teamA')
      .populate('teamB')
      .exec();
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    if (match.status === MatchStatus.COMPLETED) {
      throw new BadRequestException('Cannot add events to a completed match');
    }
    // Validación de jugador y equipo
    const player = await this.playerModel.findById(
      new Types.ObjectId(event.playerId),
    );
    if (!player) {
      throw new NotFoundException(`Player with ID ${event.playerId} not found`);
    }
    const teamId = event.team === 'TeamA' ? match.teamA._id : match.teamB._id;
    if (!player.teamId) {
      throw new BadRequestException('El jugador no pertenece a ningún equipo');
    }
    if (player.teamId.toString() !== teamId.toString()) {
      throw new BadRequestException(
        'Player does not belong to the specified team',
      );
    }
    if (!match.events) {
      match.events = [];
    }

    match.events.push({
      ...event,
      minute: event.minute ?? 0,
      playerId: new Types.ObjectId(event.playerId),
      timestamp: new Date(),
    });

    // Actualizar los scores basados en los eventos
    const teamAGoals = match.events.filter(
      (e) => e.team === 'TeamA' && e.type === MatchEventType.GOAL,
    ).length;
    const teamBGoals = match.events.filter(
      (e) => e.team === 'TeamB' && e.type === MatchEventType.GOAL,
    ).length;

    match.homeScore = teamAGoals;
    match.awayScore = teamBGoals;

    // Actualizar el resultado
    if (teamAGoals > teamBGoals) {
      match.result = 'TeamA';
    } else if (teamBGoals > teamAGoals) {
      match.result = 'TeamB';
    } else {
      match.result = 'Draw';
    }

    // (No actualizar stats.played, wins, draws, losses, points aquí)

    // Actualizar estadísticas de los equipos en sus registros
    const matchday = await this.matchdayModel.findById(match.matchDayId);
    if (!matchday) {
      throw new NotFoundException('Matchday not found');
    }
    const phase = await this.phaseModel.findById(matchday.phaseId);
    if (!phase) {
      throw new NotFoundException('Phase not found');
    }
    const teamAId = match.teamA;
    const tournamentId = phase.tournamentId;

    // Actualizar estadísticas según el tipo de evento
    switch (event.type) {
      case MatchEventType.GOAL:
        if (event.team === 'TeamA') {
          // Actualizar registro de TeamA
          await this.registrationModel.findOneAndUpdate(
            {
              teamId: teamAId._id.toString(),
              tournamentId: tournamentId.toString(),
            },
            {
              $inc: {
                'stats.goalsFor': 1,
              },
              $push: {
                'stats.goals': {
                  matchId: match._id,
                  minute: event.minute,
                },
              },
            },
          );
          // Actualizar registro de TeamB
          await this.registrationModel.findOneAndUpdate(
            {
              teamId: match.teamB._id.toString(),
              tournamentId: tournamentId.toString(),
            },
            {
              $inc: {
                'stats.goalsAgainst': 1,
              },
            },
          );
        } else {
          // Actualizar registro de TeamB
          await this.registrationModel.findOneAndUpdate(
            {
              teamId: match.teamB._id.toString(),
              tournamentId: tournamentId.toString(),
            },
            {
              $inc: {
                'stats.goalsFor': 1,
              },
              $push: {
                'stats.goals': {
                  matchId: match._id,
                  minute: event.minute,
                },
              },
            },
          );
          // Actualizar registro de TeamA
          await this.registrationModel.findOneAndUpdate(
            {
              teamId: match.teamA._id.toString(),
              tournamentId: tournamentId.toString(),
            },
            {
              $inc: {
                'stats.goalsAgainst': 1,
              },
            },
          );
        }
        // Actualizar estadísticas del jugador
        await this.playerModel.findByIdAndUpdate(event.playerId, {
          $inc: { 'stats.goals': 1 },
        });
        break;

      case MatchEventType.YELLOW_CARD:
        {
          await this.registrationModel.findOneAndUpdate(
            {
              teamId:
                event.team === 'TeamA'
                  ? match.teamA._id.toString()
                  : match.teamB._id.toString(),
              tournamentId: tournamentId.toString(),
            },
            {
              $inc: {
                'stats.yellowCards': 1,
              },
            },
          );
        }
        // Actualizar estadísticas del jugador
        await this.playerModel.findByIdAndUpdate(event.playerId, {
          $inc: { 'stats.yellowCards': 1 },
        });
        break;

      case MatchEventType.RED_CARD:
        await this.registrationModel.findOneAndUpdate(
          {
            teamId:
              event.team === 'TeamA'
                ? match.teamA._id.toString()
                : match.teamB._id.toString(),
            tournamentId: tournamentId.toString(),
          },
          {
            $inc: {
              'stats.redCards': 1,
            },
          },
        );
        // Actualizar estadísticas del jugador
        await this.playerModel.findByIdAndUpdate(event.playerId, {
          $inc: { 'stats.redCards': 1 },
        });
        break;

      case MatchEventType.BLUE_CARD:
        await this.registrationModel.findOneAndUpdate(
          {
            teamId:
              event.team === 'TeamA'
                ? match.teamA._id.toString()
                : match.teamB._id.toString(),
            tournamentId: tournamentId.toString(),
          },
          {
            $inc: {
              'stats.blueCards': 1,
            },
          },
        );
        // Actualizar estadísticas del jugador
        await this.playerModel.findByIdAndUpdate(event.playerId, {
          $inc: { 'stats.blueCards': 1 },
        });
        break;
    }

    // Obtener el registro actualizado del equipo
    const registration = await this.registrationModel.findOne({
      teamId: teamId.toString(),
      tournamentId: tournamentId.toString(),
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Calcular los nuevos valores
    const fairPlayScore =
      (registration.stats.yellowCards || 0) * -1 +
      (registration.stats.blueCards || 0) * -2 +
      (registration.stats.redCards || 0) * -3;
    const goalDifference =
      (registration.stats.goalsFor || 0) -
      (registration.stats.goalsAgainst || 0);
    const scoreWeight =
      (registration.stats.points || 0) * 10_000_000 +
      (100_000 + fairPlayScore) * 1_000 +
      goalDifference;

    // Actualizar los campos en el registro
    await this.registrationModel.findOneAndUpdate(
      {
        teamId: teamId._id.toString(),
        tournamentId: tournamentId.toString(),
      },
      {
        $set: {
          'stats.fairPlayScore': fairPlayScore,
          'stats.goalDifference': goalDifference,
          'stats.scoreWeight': scoreWeight,
        },
      },
    );

    return match.save();
  }

  async completeMatch(id: string): Promise<Match> {
    console.log('completando match', id);
    const match = await this.matchModel.findById(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    if (match.status === MatchStatus.COMPLETED) {
      throw new BadRequestException('Match is already completed');
    }

    // Obtener el torneo del matchday
    const matchday = await this.matchdayModel.findById(match.matchDayId);
    if (!matchday) {
      throw new NotFoundException('Matchday not found');
    }
    const phase = await this.phaseModel.findById(matchday.phaseId);
    if (!phase) {
      throw new NotFoundException('Phase not found');
    }

    const tournamentId = phase.tournamentId;

    // Actualizar estadísticas de los equipos SOLO AQUÍ
    const teamAGoals = match.events.filter(
      (e) => e.team === 'TeamA' && e.type === MatchEventType.GOAL,
    ).length;
    const teamBGoals = match.events.filter(
      (e) => e.team === 'TeamB' && e.type === MatchEventType.GOAL,
    ).length;

    // Helper para obtener el id de un equipo de forma segura
    function getTeamId(team: any): string {
      if (!team) return '';
      if (typeof team === 'object' && team._id) return String(team._id);
      return String(team);
    }

    // Actualizar registro de TeamA
    await this.registrationModel.findOneAndUpdate(
      { teamId: getTeamId(match.teamA), tournamentId: tournamentId.toString() },
      {
        $inc: {
          'stats.wins': teamAGoals > teamBGoals ? 1 : 0,
          'stats.draws': teamAGoals === teamBGoals ? 1 : 0,
          'stats.losses': teamAGoals < teamBGoals ? 1 : 0,
          'stats.played': 1,
          'stats.points':
            teamAGoals > teamBGoals ? 3 : teamAGoals === teamBGoals ? 1 : 0,
        },
      },
    );

    // Actualizar registro de TeamB
    await this.registrationModel.findOneAndUpdate(
      { teamId: getTeamId(match.teamB), tournamentId: tournamentId.toString() },
      {
        $inc: {
          'stats.wins': teamBGoals > teamAGoals ? 1 : 0,
          'stats.draws': teamBGoals === teamAGoals ? 1 : 0,
          'stats.losses': teamBGoals < teamAGoals ? 1 : 0,
          'stats.played': 1,
          'stats.points':
            teamBGoals > teamAGoals ? 3 : teamBGoals === teamAGoals ? 1 : 0,
        },
      },
    );

    // Marcar el partido como completado
    match.status = MatchStatus.COMPLETED;
    return match.save();
  }

  async remove(id: string): Promise<void> {
    const match = await this.findOne(id);
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    // Obtener el torneo del matchday
    const matchday = await this.matchdayModel.findById(match.matchDayId);
    if (!matchday) {
      throw new NotFoundException('Matchday not found');
    }
    const phase = await this.phaseModel.findById(matchday.phaseId);
    if (!phase) {
      throw new NotFoundException('Phase not found');
    }

    const tournamentId = phase.tournamentId;

    // Revertir las estadísticas de los equipos
    const teamAGoals = match.events.filter(
      (e) => e.team === 'TeamA' && e.type === MatchEventType.GOAL,
    ).length;
    const teamBGoals = match.events.filter(
      (e) => e.team === 'TeamB' && e.type === MatchEventType.GOAL,
    ).length;

    const teamAYellowCards = match.events.filter(
      (e) => e.team === 'TeamA' && e.type === MatchEventType.YELLOW_CARD,
    ).length;
    const teamBYellowCards = match.events.filter(
      (e) => e.team === 'TeamB' && e.type === MatchEventType.YELLOW_CARD,
    ).length;

    const teamARedCards = match.events.filter(
      (e) => e.team === 'TeamA' && e.type === MatchEventType.RED_CARD,
    ).length;
    const teamBRedCards = match.events.filter(
      (e) => e.team === 'TeamB' && e.type === MatchEventType.RED_CARD,
    ).length;

    const teamABlueCards = match.events.filter(
      (e) => e.team === 'TeamA' && e.type === MatchEventType.BLUE_CARD,
    ).length;
    const teamBBlueCards = match.events.filter(
      (e) => e.team === 'TeamB' && e.type === MatchEventType.BLUE_CARD,
    ).length;

    // Actualizar registro de TeamA
    await this.registrationModel.findOneAndUpdate(
      { teamId: match.teamA._id, tournamentId: tournamentId.toString() },
      {
        $inc: {
          'stats.goalsFor': -teamAGoals,
          'stats.goalsAgainst': -teamBGoals,
          'stats.wins': teamAGoals > teamBGoals ? -1 : 0,
          'stats.draws': teamAGoals === teamBGoals ? -1 : 0,
          'stats.losses': teamAGoals < teamBGoals ? -1 : 0,
          'stats.yellowCards': -teamAYellowCards,
          'stats.redCards': -teamARedCards,
          'stats.blueCards': -teamABlueCards,
        },
        $pull: {
          'stats.goals': { matchId: match._id },
        },
      },
    );

    // Actualizar registro de TeamB
    await this.registrationModel.findOneAndUpdate(
      { teamId: match.teamB._id, tournamentId: tournamentId.toString() },
      {
        $inc: {
          'stats.goalsFor': -teamBGoals,
          'stats.goalsAgainst': -teamAGoals,
          'stats.wins': teamBGoals > teamAGoals ? -1 : 0,
          'stats.draws': teamBGoals === teamAGoals ? -1 : 0,
          'stats.losses': teamBGoals < teamAGoals ? -1 : 0,
          'stats.yellowCards': -teamBYellowCards,
          'stats.redCards': -teamBRedCards,
          'stats.blueCards': -teamBBlueCards,
        },
        $pull: {
          'stats.goals': { matchId: match._id },
        },
      },
    );

    // Eliminar el partido
    await this.matchModel.findByIdAndDelete(id);
  }

  async findByFilters(filters: {
    refereeId?: string;
    viewerId?: string;
    fieldNumber?: string;
  }): Promise<Match[]> {
    const query: any = {};
    if (filters.refereeId) query.refereeId = filters.refereeId;
    if (filters.viewerId) query.viewerId = filters.viewerId;
    if (filters.fieldNumber) query.fieldNumber = filters.fieldNumber;
    return this.matchModel
      .find(query)
      .populate({
        path: 'teamA teamB',
      })
      .populate({
        path: 'matchDayId',
        populate: {
          path: 'phaseId',
          populate: {
            path: 'tournamentId',
          },
        },
      })
      .exec();
  }

  async updatePlayerMatches(
    matchId: string,
    playerMatches: any[],
  ): Promise<Match> {
    const match = await this.matchModel.findByIdAndUpdate(
      matchId,
      { playerMatches },
      { new: true },
    );
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }
    return match;
  }
}
