import React, { useState } from "react";
import { Matchday } from "../../models/Matchday";
import { Match, MatchEvent, MatchEventType } from "../../models/Match";
import { useMatchdayMatches } from "../../api/fixtureHooks";
import {
  useCompleteMatch,
  useUpdateMatch,
  MatchUpdateData,
} from "../../api/matchHooks";
import { MatchEventsList } from "../matches/MatchEventEditor";
import { useUsers } from "../../api/userHooks";

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
  const { data: users = [] } = useUsers();
  const [fieldValues, setFieldValues] = useState<
    Record<
      string,
      { fieldNumber?: string; viewerId?: string; refereeId?: string }
    >
  >({});

  const handleFieldChange = (matchId: string, field: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  const handleSave = (match: Match) => {
    const values = fieldValues[match._id] || {};
    const data: MatchUpdateData = {
      matchId: match._id,
      viewerId: values.viewerId,
      refereeId: values.refereeId,
      fieldNumber: values.fieldNumber,
    };
    updateMatch(data, {
      onSuccess: () => {
        setEditingMatchId(null);
      },
    });
  };

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

  // Helper para mostrar nombre de usuario por id
  const getUserName = (userId?: string) => {
    if (!userId) return "-";
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "-";
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
                      {editingMatchId === match._id && !match.completed ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2 items-center">
                            <label className="text-xs">N° Cancha:</label>
                            <input
                              type="text"
                              className="border rounded px-2 py-1 text-xs"
                              value={fieldValues[match._id]?.fieldNumber || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  match._id,
                                  "fieldNumber",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <label className="text-xs">Veedor:</label>
                            <select
                              className="border rounded px-2 py-1 text-xs"
                              value={fieldValues[match._id]?.viewerId || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  match._id,
                                  "viewerId",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Seleccionar</option>
                              {users
                                .filter((u) => u.role === "Viewer")
                                .map((u) => (
                                  <option key={u._id} value={u._id}>
                                    {u.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div className="flex gap-2 items-center">
                            <label className="text-xs">Referee:</label>
                            <select
                              className="border rounded px-2 py-1 text-xs"
                              value={fieldValues[match._id]?.refereeId || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  match._id,
                                  "refereeId",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Seleccionar</option>
                              {users
                                .filter((u) => u.role === "Referee")
                                .map((u) => (
                                  <option key={u._id} value={u._id}>
                                    {u.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                              onClick={() => handleSave(match)}
                            >
                              Guardar
                            </button>
                            <button
                              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs"
                              onClick={() => setEditingMatchId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm mb-1">
                            <span className="font-medium">
                              {match.homeScore !== null ? match.homeScore : 0} -{" "}
                              {match.awayScore !== null ? match.awayScore : 0}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-700 mb-1">
                            <div>
                              <span className="font-semibold">N° Cancha:</span>{" "}
                              {match.fieldNumber || "-"}
                            </div>
                            <div>
                              <span className="font-semibold">Veedor:</span>{" "}
                              {getUserName(match.viewerId)}
                            </div>
                            <div>
                              <span className="font-semibold">Referee:</span>{" "}
                              {getUserName(match.refereeId)}
                            </div>
                          </div>
                          {!match.completed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMatchId(match._id);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Editar datos
                            </button>
                          )}
                          {match.result && match.completed && (
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
