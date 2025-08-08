import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import Header from "../components/layout/Header";
import { usePhase } from "../api/phaseHooks";
import { usePhaseMatchdays, useMatchdayMatches } from "../api/fixtureHooks";
import { useTournament } from "../api/tournamentHooks";

const MatchdayList: React.FC = () => {
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

  const isLoading = isPhaseLoading || isMatchdaysLoading;

  const toggleMatchday = (matchdayId: string) => {
    setExpandedMatchdays((prev) => ({
      ...prev,
      [matchdayId]: !prev[matchdayId],
    }));
  };

  const handleBack = () => {
    navigate(`/divisions/${tournamentId}/phases/${phaseId}`);
  };

  // Sort matchdays by order
  const sortedMatchdays = [...matchdays].sort((a, b) => a.order - b.order);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando calendario...</span>
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
            onClick={handleBack}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver a la Fase</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Calendario de {phase?.name}
            </h1>
            <p className="text-gray-600">
              {tournament?.name} | {matchdays.length} jornadas
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-medium text-gray-800">Jornadas</h2>
          </div>

          {sortedMatchdays.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">
                No hay jornadas definidas para esta fase.
              </p>
              <button
                onClick={() =>
                  navigate(
                    `/divisions/${tournamentId}/phases/${phaseId}/fixture`
                  )
                }
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Generar Calendario
              </button>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto px-2">
              <div className="flex flex-wrap gap-6">
                {sortedMatchdays.map((matchday) => (
                  <div
                    key={matchday._id}
                    className="w-full sm:w-[calc(50%-0.75rem)] flex-1 min-w-[280px]"
                  >
                    <MatchdayItem
                      matchday={matchday}
                      isExpanded={!!expandedMatchdays[matchday._id]}
                      onToggle={() => toggleMatchday(matchday._id)}
                      isComplete={false}
                    />
                  </div>
                ))}
              </div>
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
  isComplete: boolean;
}

const MatchdayItem: React.FC<MatchdayItemProps> = ({
  matchday,
  isExpanded,
  onToggle,
  isComplete,
}) => {
  const { data: matches = [], isLoading } = useMatchdayMatches(
    isExpanded ? matchday._id : undefined
  );

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
              {matches.map((match) => (
                <div
                  key={match._id}
                  className="bg-white p-3 rounded-md shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium">
                        {match.teamA?.name || "Equipo A"}
                      </div>
                      <div className="text-gray-500">vs</div>
                      <div className="font-medium">
                        {match.teamB?.name || "Equipo B"}
                      </div>
                    </div>
                    <div>
                      {match.result ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {match.result === "TeamA"
                            ? `Victoria ${match.teamA?.name || "Equipo A"}`
                            : match.result === "TeamB"
                            ? `Victoria ${match.teamB?.name || "Equipo B"}`
                            : "Empate"}
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>

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

export default MatchdayList;
