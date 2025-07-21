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
import { MatchEventEditor } from "../matches/MatchEventEditor";
import { Modal } from "antd";

interface MatchdayItemProps {
  matchday: Matchday;
  // isExpanded: boolean; // Eliminado
  // onToggle: () => void; // Eliminado
}

const MatchdayItem: React.FC<MatchdayItemProps> = ({ matchday }) => {
  const { data: matches = [], isLoading } = useMatchdayMatches(matchday._id);
  const { mutate: updateMatch } = useUpdateMatch();
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const { mutate: completeMatch } = useCompleteMatch();
  const { data: users = [] } = useUsers();
  const [fieldValues, setFieldValues] = useState<
    Record<
      string,
      {
        fieldNumber?: string;
        viewerId?: string;
        refereeId?: string;
        date?: string;
        time?: string;
      }
    >
  >({});
  const [editingEventMatchId, setEditingEventMatchId] = useState<string | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);

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
    // Combinar fecha y hora si ambos están presentes
    let dateTime = match.date;
    if (values.date && values.time) {
      const [hours, minutes] = values.time.split(":");
      const date = new Date(values.date);
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      dateTime = date.toISOString();
    }
    const data: MatchUpdateData = {
      matchId: match._id,
      viewerId: values.viewerId,
      refereeId: values.refereeId,
      fieldNumber: values.fieldNumber,
      date: dateTime,
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
  const getUserName = (userObjOrId?: any) => {
    if (!userObjOrId) return "-";
    // Si es un objeto con _id, usar ese id
    const userId =
      typeof userObjOrId === "object" && userObjOrId._id
        ? userObjOrId._id
        : userObjOrId;
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "-";
  };

  // Helper para formatear fecha y hora
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const day = date.toLocaleDateString();
    const hour = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day} ${hour}`;
  };

  return (
    <div className="rounded-xl shadow-lg p-6 bg-white transition flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-xl mb-1">Fecha {matchday.order}</h3>
        {matchday.date && (
          <p className="text-sm text-gray-500">
            {new Date(matchday.date).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="mt-2 space-y-1">
        {isLoading ? (
          <span className="text-gray-400 text-xs">Cargando partidos...</span>
        ) : matches.length === 0 ? (
          <span className="text-gray-400 text-xs">
            No hay partidos definidos
          </span>
        ) : (
          matches.map((match: Match) => {
            const dateObj = match.date ? new Date(match.date) : null;
            const day = dateObj ? dateObj.toLocaleDateString() : "-";
            const hour = dateObj
              ? dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-";
            return (
              <div
                key={match._id}
                className="flex flex-col gap-1 text-sm border-b last:border-b-0 pb-2 mb-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black">
                    {match.teamA.name}
                  </span>
                  <span className="text-gray-500 font-semibold">vs</span>
                  <span className="font-bold text-black">
                    {match.teamB.name}
                  </span>
                  {match.completed && (
                    <span className="ml-2 bg-green-100 text-green-800 text-lg px-3 py-1 rounded font-bold flex items-center gap-1">
                      <span className="text-2xl">{match.homeScore}</span>
                      <span className="text-xl">-</span>
                      <span className="text-2xl">{match.awayScore}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 pl-1">
                  Día: {day} Hora: {hour}
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-600 rounded"
                    onClick={() => setShowDetailModal(match._id)}
                  >
                    Ver detalles
                  </button>
                </div>
                <Modal
                  open={showDetailModal === match._id}
                  onCancel={() => setShowDetailModal(null)}
                  footer={null}
                  title={
                    <div className="flex flex-col gap-1">
                      <span className="text-lg font-bold text-center mb-2">
                        {match.teamA.name}{" "}
                        <span className="text-gray-400">vs</span>{" "}
                        {match.teamB.name}
                      </span>
                      {match.completed && (
                        <span className="flex justify-center items-center gap-2 text-2xl font-bold text-green-700 mb-2">
                          {match.homeScore}
                          <span className="text-xl">-</span>
                          {match.awayScore}
                        </span>
                      )}
                    </div>
                  }
                  width={520}
                  destroyOnClose
                  className="custom-match-modal"
                >
                  <div className="flex flex-col gap-6 p-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">Fecha</span>
                        <span className="font-semibold text-base">{day}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">Hora</span>
                        <span className="font-semibold text-base">{hour}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">N° Cancha</span>
                        <span className="font-semibold text-base">
                          {match.fieldNumber || "-"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">Veedor</span>
                        <span className="font-semibold text-base">
                          {getUserName(match.viewerId)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">Referee</span>
                        <span className="font-semibold text-base">
                          {getUserName(match.refereeId)}
                        </span>
                      </div>
                    </div>
                    {editingMatchId === match._id && !match.completed ? (
                      <div className="flex flex-col gap-2 border-t pt-4 mt-2">
                        <div className="flex gap-2 items-center">
                          <label className="text-xs">Fecha:</label>
                          <input
                            type="date"
                            className="border rounded px-2 py-1 text-xs"
                            value={fieldValues[match._id]?.date || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                match._id,
                                "date",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="text-xs">Hora:</label>
                          <select
                            className="border rounded px-2 py-1 text-xs"
                            value={fieldValues[match._id]?.time || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                match._id,
                                "time",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Seleccionar</option>
                            {Array.from({ length: 16 }, (_, i) => {
                              const hour = i + 8;
                              return (
                                <option
                                  key={hour}
                                  value={`${hour
                                    .toString()
                                    .padStart(2, "0")}:00`}
                                >
                                  {hour.toString().padStart(2, "0")}:00
                                </option>
                              );
                            })}
                          </select>
                        </div>
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
                      <div className="flex flex-col gap-2 mt-4">
                        {!match.completed && (
                          <button
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-600 rounded"
                            onClick={() => setEditingMatchId(match._id)}
                          >
                            Editar datos
                          </button>
                        )}
                        {match.completed && (
                          <button
                            className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1 border border-gray-600 rounded"
                            onClick={() => {
                              window.open(
                                `/match/${match._id}/report`,
                                "_blank"
                              );
                            }}
                          >
                            Ver ficha
                          </button>
                        )}
                        {match.result && match.completed && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-2">
                            {match.result === "TeamA"
                              ? `Victoria ${match.teamA.name}`
                              : match.result === "TeamB"
                              ? `Victoria ${match.teamB.name}`
                              : "Empate"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Modal>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MatchdayItem;
