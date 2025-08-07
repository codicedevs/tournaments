import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  EditIcon,
} from "lucide-react";

import { Modal } from "antd";
import { es } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface MatchdayItemProps {
  matchday: Matchday;
  tournamentId: string;
}

const MatchdayItem: React.FC<MatchdayItemProps> = ({
  matchday,
  tournamentId,
}) => {
  const navigate = useNavigate();
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
  const [isExpanded, setIsExpanded] = useState(true);

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
      const localDateTimeString = `${format(date, "yyyy-MM-dd", {
        locale: es,
      })}T${values.time}:00`;
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
    <div className="rounded-xl shadow-lg bg-white overflow-hidden">
      {/* Header colapsable */}
      <div
        className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5 text-white" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-white" />
            )}
            <h3 className="font-bold text-xl text-white">
              Fecha {matchday.order}
            </h3>
            <span className="text-blue-100 text-sm">
              {matches.length} partido{matches.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="text-white text-sm">
            {isExpanded ? "Ocultar partidos" : "Mostrar partidos"}
          </div>
        </div>
      </div>

      {/* Contenido colapsable */}
      {isExpanded && (
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando partidos...</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span>No hay partidos definidos para esta fecha</span>
            </div>
          ) : (
            <div className="space-y-2 overflow-x-auto">
              {/* Encabezados de columnas */}
              <div className="flex items-center gap-3 bg-white py-2 px-2 rounded-t-md text-xs font-semibold text-blue-800 uppercase min-w-[900px]">
                {/* Espacios vacíos para alinear con Equipo A, VS y Equipo B */}
                <span className="w-32"></span>
                <span className="w-6"></span>
                <span className="w-32"></span>
                <span className="w-20 text-center">Resultado</span>
                <span className="w-24 text-center">Estado</span>
                <span className="w-36 text-center">Fecha / Hora</span>
                <span className="w-20 text-center">Cancha</span>
                <span className="w-32 text-center">Veedor</span>
                <span className="w-32 text-center">Árbitro</span>
                <span className="w-28 text-right">Acciones</span>
              </div>
              {matches.map((match: Match) => {
                const dateObj = match.date ? parseISO(match.date) : null;
                const dayHour = dateObj
                  ? format(dateObj, "dd/MM/yyyy HH:mm", { locale: es })
                  : "-";
                return (
                  <div
                    key={match._id}
                    className="flex items-center gap-3 border-b last:border-b-0 py-2 px-2 min-w-[900px] hover:bg-blue-50 transition"
                  >
                    {/* Equipo A */}
                    <span className="font-bold text-gray-800 w-32 truncate text-right">
                      {match.teamA.name}
                    </span>
                    {/* VS */}
                    <span className="text-gray-500 font-semibold w-6 text-center">
                      vs
                    </span>
                    {/* Equipo B */}
                    <span className="font-bold text-gray-800 w-32 truncate text-left">
                      {match.teamB.name}
                    </span>
                    {/* Resultado */}
                    <span className="w-20 text-center">
                      {match.status === MatchStatus.FINISHED ||
                      match.status === MatchStatus.COMPLETED ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-bold">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </span>
                    {/* Estado */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold border w-24 text-center ${estadoClass(
                        match.status,
                        match
                      )}`}
                    >
                      {estadoTexto(match.status, match)}
                    </span>
                    {/* Fecha/Hora */}
                    <span className="w-36 text-center text-gray-700">
                      {dayHour}
                    </span>
                    {/* Cancha */}
                    <span className="w-20 text-center text-gray-700">
                      {match.fieldNumber || "-"}
                    </span>
                    {/* Veedor */}
                    <span
                      className="w-32 text-center text-gray-700 truncate"
                      title={getUserName(match.viewerId)}
                    >
                      {getUserName(match.viewerId)}
                    </span>
                    {/* Árbitro */}
                    <span
                      className="w-32 text-center text-gray-700 truncate"
                      title={getUserName(match.refereeId)}
                    >
                      {getUserName(match.refereeId)}
                    </span>
                    {/* Botones */}
                    <div className="flex gap-2 ml-2">
                      <button
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs px-3 py-1 border border-blue-600 rounded hover:bg-blue-50 transition"
                        onClick={() => setShowDetailModal(match._id)}
                      >
                        <EditIcon size={14} />
                        Editar
                      </button>
                      <button
                        className="flex items-center gap-1 text-green-600 hover:text-green-800 text-xs px-3 py-1 border border-green-600 rounded hover:bg-green-50 transition"
                        onClick={() => {
                          navigate(`/match/${match._id}/report`);
                        }}
                      >
                        <EyeIcon size={14} />
                        Ficha
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de edición */}
      <Modal
        open={showDetailModal !== null}
        onCancel={() => setShowDetailModal(null)}
        footer={null}
        title={
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-center mb-2">
              {showDetailModal &&
                matches.find((m) => m._id === showDetailModal)?.teamA.name}{" "}
              <span className="text-gray-400">vs</span>{" "}
              {showDetailModal &&
                matches.find((m) => m._id === showDetailModal)?.teamB.name}
            </span>
            {showDetailModal &&
              (() => {
                const match = matches.find((m) => m._id === showDetailModal);
                return (
                  (match?.status === MatchStatus.FINISHED ||
                    match?.status === MatchStatus.COMPLETED) && (
                    <span className="flex justify-center items-center gap-2 text-2xl font-bold text-green-700 mb-2">
                      {match?.homeScore}
                      <span className="text-xl">-</span>
                      {match?.awayScore}
                    </span>
                  )
                );
              })()}
          </div>
        }
        width={540}
        destroyOnClose
        className="custom-match-modal"
      >
        {showDetailModal &&
          (() => {
            const match = matches.find((m) => m._id === showDetailModal);
            if (!match) return null;

            return (
              <div className="flex flex-col gap-6 p-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-gray-500">Fecha</span>
                    <DatePicker
                      locale={es}
                      dateFormat="dd/MM/yyyy"
                      selected={(() => {
                        const dateStr = fieldValues[match._id]?.date ?? match.date;
                        return dateStr ? new Date(dateStr) : null;
                      })()}
                      onChange={(date: Date | null) =>
                        handleFieldChange(
                          match._id,
                          "date",
                          date ? date.toISOString().split("T")[0] : ""
                        )
                      }
                      className="border rounded px-2 py-1 text-base focus:ring-2 focus:ring-blue-400 w-full"
                      placeholderText="dd/mm/aaaa"
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
                      step="3600"
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
                        handleFieldChange(match._id, "viewerId", e.target.value)
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
            );
          })()}
      </Modal>
    </div>
  );
};

export default MatchdayItem;
