import React, { useState } from "react";
import { Matchday } from "../../models/Matchday";
import {
  Match,
  MatchEvent,
  MatchEventType,
  MatchStatus,
} from "../../models/Match";
import { useMatchdayMatches } from "../../api/fixtureHooks";
import {
  useCompleteMatch,
  useUpdateMatch,
  MatchUpdateData,
} from "../../api/matchHooks";
import { useUsers } from "../../api/userHooks";
import { format, parseISO } from "date-fns";

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
    let dateTime = match.date;
    if (values.date && values.time) {
      // Combinar fecha y hora local y convertir a UTC ISO
      const localDateTimeString = `${values.date}T${values.time}:00`;
      dateTime = new Date(localDateTimeString).toISOString();
    } else if (values.date) {
      // Solo fecha, hora 00:00 UTC
      const localDateTimeString = `${values.date}T00:00:00`;
      dateTime = new Date(localDateTimeString).toISOString();
    } else if (values.time && match.date) {
      // Solo hora, combinar con la fecha original
      const date = new Date(match.date);
      const localDateTimeString = `${format(date, "yyyy-MM-dd")}T${
        values.time
      }:00`;
      dateTime = new Date(localDateTimeString).toISOString();
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

  const estadoClass = (status: MatchStatus, match: any) => {
    if (status === MatchStatus.UNASSIGNED && match.date) {
      return "bg-blue-100 text-blue-700 border border-blue-300";
    }
    switch (status) {
      case MatchStatus.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case MatchStatus.FINISHED:
        return "bg-green-100 text-green-700 border border-green-300";
      case MatchStatus.COMPLETED:
        return "bg-gray-200 text-gray-700 border border-gray-400";
      case MatchStatus.SCHEDULED:
        return "bg-blue-100 text-blue-700 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };
  const estadoTexto = (status: MatchStatus, match: any) => {
    if (status === MatchStatus.UNASSIGNED && match.date) {
      return "Programado";
    }
    switch (status) {
      case MatchStatus.UNASSIGNED:
        return "Sin programar";
      case MatchStatus.SCHEDULED:
        return "Programado";
      case MatchStatus.IN_PROGRESS:
        return "En juego";
      case MatchStatus.FINISHED:
        return "Finalizado";
      case MatchStatus.COMPLETED:
        return "Completado";
      default:
        return "-";
    }
  };

  return (
    <div className="rounded-xl shadow-lg p-6 bg-white transition flex flex-col">
      <div className="mb-4">
        <h3 className="font-bold text-xl mb-1">Fecha {matchday.order}</h3>
        {/* Eliminado: solo mostrar la fecha de los partidos, no la de la jornada */}
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
            const dateObj = match.date ? parseISO(match.date) : null;
            const dayHour = dateObj ? dateObj.toLocaleString() : "-";
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
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-xs font-bold border ${estadoClass(
                      match.status,
                      match
                    )}`}
                  >
                    {estadoTexto(match.status, match)}
                  </span>
                  {(match.status === MatchStatus.FINISHED ||
                    match.status === MatchStatus.COMPLETED) && (
                    <span className="ml-2 bg-green-100 text-green-800 text-lg px-3 py-1 rounded font-bold flex items-center gap-1">
                      <span className="text-2xl">{match.homeScore}</span>
                      <span className="text-xl">-</span>
                      <span className="text-2xl">{match.awayScore}</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 pl-1">{dayHour}</div>
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
                      {(match.status === MatchStatus.FINISHED ||
                        match.status === MatchStatus.COMPLETED) && (
                        <span className="flex justify-center items-center gap-2 text-2xl font-bold text-green-700 mb-2">
                          {match.homeScore}
                          <span className="text-xl">-</span>
                          {match.awayScore}
                        </span>
                      )}
                    </div>
                  }
                  width={540}
                  destroyOnClose
                  className="custom-match-modal"
                >
                  <div className="flex flex-col gap-6 p-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">Fecha</span>
                        <input
                          type="date"
                          className="border rounded px-2 py-1 text-base focus:ring-2 focus:ring-blue-400"
                          value={
                            fieldValues[match._id]?.date ||
                            (match.date
                              ? new Date(match.date).toISOString().slice(0, 10)
                              : "")
                          }
                          onChange={(e) =>
                            handleFieldChange(match._id, "date", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">Hora</span>
                        <input
                          type="time"
                          className="border rounded px-2 py-1 text-base focus:ring-2 focus:ring-blue-400"
                          value={
                            fieldValues[match._id]?.time ||
                            (match.date
                              ? new Date(match.date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "")
                          }
                          onChange={(e) =>
                            handleFieldChange(match._id, "time", e.target.value)
                          }
                          step="3600" // Solo permite seleccionar la hora, no los minutos
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">N° Cancha</span>
                        <input
                          type="text"
                          className="border rounded px-2 py-1 text-base focus:ring-2 focus:ring-blue-400"
                          value={
                            fieldValues[match._id]?.fieldNumber ||
                            match.fieldNumber ||
                            ""
                          }
                          onChange={(e) =>
                            handleFieldChange(
                              match._id,
                              "fieldNumber",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">Veedor</span>
                        <select
                          className="border rounded px-2 py-1 text-base focus:ring-2 focus:ring-blue-400"
                          value={
                            fieldValues[match._id]?.viewerId ||
                            (typeof match.viewerId === "object"
                              ? match.viewerId._id
                              : match.viewerId) ||
                            ""
                          }
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
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-500">Referee</span>
                        <select
                          className="border rounded px-2 py-1 text-base focus:ring-2 focus:ring-blue-400"
                          value={
                            fieldValues[match._id]?.refereeId ||
                            (typeof match.refereeId === "object"
                              ? match.refereeId._id
                              : match.refereeId) ||
                            ""
                          }
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
                    </div>
                    <div className="flex flex-row justify-end gap-2 mt-4">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-bold shadow"
                        onClick={() => {
                          handleSave(match);
                          setShowDetailModal(null);
                        }}
                      >
                        Guardar
                      </button>
                      <button
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-5 py-2 rounded font-bold shadow"
                        onClick={() => setShowDetailModal(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                    {(match.status === MatchStatus.FINISHED ||
                      match.status === MatchStatus.COMPLETED) && (
                      <div className="flex flex-col items-center mt-4">
                        <span className="text-lg font-bold text-green-700 mb-2">
                          Resultado: {match.homeScore} - {match.awayScore}
                        </span>
                        {match.result && (
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
