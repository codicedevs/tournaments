import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  CalendarIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import Header from "../components/layout/Header";
import { usePhase } from "../api/phaseHooks";
import { useTournament } from "../api/tournamentHooks";
import { usePhaseMatchdays, useMatchdayMatches } from "../api/fixtureHooks";
import { useRegistrationsByTournament } from "../api/registrationHooks";

import { useResetTeamStats } from "../api/teamHooks";
import {
  MatchEventEditor,
  MatchEventsList,
} from "../components/matches/MatchEventEditor";
import { Match, MatchEvent } from "../models/Match";
import { useUpdateMatch } from "../api/matchHooks";

const PhaseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId, phaseId } = useParams<{
    tournamentId: string;
    phaseId: string;
  }>();
  const [expandedMatchdays, setExpandedMatchdays] = useState<
    Record<string, boolean>
  >({});

  // Data fetching
  const { data: phase, isLoading: isPhaseLoading } = usePhase(phaseId);
  const { data: tournament } = useTournament(tournamentId!);
  const { data: matchdays = [], isLoading: isMatchdaysLoading } =
    usePhaseMatchdays(phaseId);
  const { data: registrations = [] } =
    useRegistrationsByTournament(tournamentId);
  console.log("regis", registrations);
  const { mutate: resetStats } = useResetTeamStats();

  const isLoading = isPhaseLoading || isMatchdaysLoading;

  const toggleMatchday = (matchdayId: string) => {
    setExpandedMatchdays((prev) => ({
      ...prev,
      [matchdayId]: !prev[matchdayId],
    }));
  };

  // Sort matchdays by order
  const sortedMatchdays = [...matchdays].sort((a, b) => a.order - b.order);

  const handleGenerateFixture = () => {
    navigate(`/tournaments/${tournamentId}/phases/${phaseId}/fixture`);
  };

  const handleViewFixture = () => {
    navigate(`/tournaments/${tournamentId}/phases/${phaseId}/matchdays`);
  };

  const handleResetStats = () => {
    if (
      window.confirm(
        "¿Estás seguro que deseas resetear todas las estadísticas? Esta acción no se puede deshacer."
      )
    ) {
      resetStats(tournamentId!);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando fase...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!phase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Fase no encontrada
            </h2>
            <button
              onClick={() => navigate(`/tournaments/${tournamentId}`)}
              className="text-blue-600 hover:text-blue-800"
            >
              Volver al torneo
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/tournaments/${tournamentId}`)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver al Torneo</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{phase?.name}</h1>
            <p className="text-gray-600">{tournament?.name}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={handleResetStats}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 border border-red-600 rounded-md hover:bg-red-50"
            >
              <TrashIcon size={16} />
              Resetear Estadísticas
            </button>
          </div>
        </div>

        {/* Sección superior: Datos del torneo y tabla de posiciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Información de la fase */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Detalles de la Fase
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Tipo
                </label>
                <p className="mt-1 text-sm text-gray-900">{phase?.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Equipos Registrados
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {registrations.length} equipos
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de Estadísticas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Tabla de Posiciones
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PJ
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    G
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GF
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GC
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DG
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration) => {
                  const teamStats = registration.stats;
                  console.log("teamStats", teamStats);
                  const stats = {
                    wins: teamStats.wins || 0,
                    draws: teamStats.draws || 0,
                    losses: teamStats.losses || 0,
                    goalsFor: teamStats.goalsFor || 0,
                    goalsAgainst: teamStats.goalsAgainst || 0,
                  };
                  const played = stats.wins + stats.draws + stats.losses;
                  const points = stats.wins * 3 + stats.draws;
                  const goalDiff = stats.goalsFor - stats.goalsAgainst;

                  return (
                    <tr key={registration.teamId._id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {registration.teamId.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                        {played}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                        {stats.wins}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                        {stats.draws}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                        {stats.losses}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                        {stats.goalsFor}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                        {stats.goalsAgainst}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500">
                        {goalDiff}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                        {points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sección inferior: Lista de jornadas y partidos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Calendario</h2>
            <button
              onClick={handleGenerateFixture}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon size={16} className="mr-1" />
              Generar Calendario
            </button>
          </div>

          {sortedMatchdays.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">
                No hay jornadas definidas para esta fase.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {sortedMatchdays.map((matchday) => (
                <MatchdayItem
                  key={matchday._id}
                  matchday={matchday}
                  isExpanded={!!expandedMatchdays[matchday._id]}
                  onToggle={() => toggleMatchday(matchday._id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Matchday item component with match list
interface MatchdayItemProps {
  matchday: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const MatchdayItem: React.FC<MatchdayItemProps> = ({
  matchday,
  isExpanded,
  onToggle,
}) => {
  const { data: matches = [], isLoading } = useMatchdayMatches(
    isExpanded ? matchday._id : undefined
  );
  const { mutate: updateMatch } = useUpdateMatch();
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

  const handleAddEvent = (matchId: string, event: MatchEvent) => {
    updateMatch(
      {
        matchId,
        event,
      },
      {
        onSuccess: () => {
          setEditingMatchId(null);
        },
      }
    );
  };

  return (
    <div className="border-b last:border-0">
      <div
        className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div>
          <h3 className="font-medium">Jornada {matchday.order}</h3>
          {matchday.date && (
            <p className="text-sm text-gray-500">
              {new Date(matchday.date).toLocaleDateString()}
            </p>
          )}
        </div>
        <button className="text-blue-600">{isExpanded ? "▼" : "▶"}</button>
      </div>

      {isExpanded && (
        <div className="bg-gray-50 px-6 py-3">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : matches.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              No hay partidos definidos para esta jornada
            </p>
          ) : (
            <div className="space-y-3">
              {matches.map((match: Match) => (
                <div
                  key={match._id}
                  className="bg-white p-3 rounded-md shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium">{match.teamA.name}</div>
                      <div className="text-gray-500">vs</div>
                      <div className="font-medium">{match.teamB.name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      {editingMatchId === match._id ? (
                        <MatchEventEditor
                          match={match}
                          onSave={(event) => handleAddEvent(match._id, event)}
                          onCancel={() => setEditingMatchId(null)}
                        />
                      ) : (
                        <>
                          <div className="text-sm">
                            <span className="font-medium">
                              {match.homeScore !== null ? match.homeScore : 0} -{" "}
                              {match.awayScore !== null ? match.awayScore : 0}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMatchId(match._id);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Agregar evento
                          </button>
                          {match.result && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {match.result === "TeamA"
                                ? `Victoria ${match.teamA.name}`
                                : match.result === "TeamB"
                                ? `Victoria ${match.teamB.name}`
                                : "Empate"}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {match.events && match.events.length > 0 && (
                    <MatchEventsList
                      events={match.events}
                      teamA={match.teamA}
                      teamB={match.teamB}
                    />
                  )}

                  {match.date && (
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(match.date).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhaseDetail;
