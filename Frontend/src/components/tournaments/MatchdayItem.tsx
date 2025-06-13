import React, { useState } from "react";
import { Matchday } from "../../models/Matchday";
import { Match, MatchEvent, MatchEventType } from "../../models/Match";
import { useMatchdayMatches } from "../../api/fixtureHooks";
import { useCompleteMatch, useUpdateMatch } from "../../api/matchHooks";
import { MatchEventEditor, MatchEventsList } from "../matches/MatchEventEditor";

interface MatchdayItemProps {
  matchday: Matchday;
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
  const { mutate: completeMatch } = useCompleteMatch();

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

  const handleCompleteMatch = (matchId: string) => {
    completeMatch({ matchId });
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMatchId(match._id);
                              handleCompleteMatch(match._id);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Finalizar partido
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

export default MatchdayItem;
