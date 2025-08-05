import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  useMatchById,
  useMatchTournamentDetails,
  useCompleteMatch,
  useMatchObservations,
  useUpdateMatchObservations,
  useUpdateMatchEvent,
  useDeleteMatchEvent,
} from "../api/matchHooks";
import { useQueryClient } from "@tanstack/react-query";
import { translateEventType, formatDate } from "../utils/functions";
import type { ConfirmedPlayer } from "../interfaces/interfaces.match";
import StandingsTable from "../components/tournaments/StandingsTable";
import { useRegistrationsByTournament } from "../api/registrationHooks";
import { MatchStatus } from "../models";

interface MatchReportProps {
  confirmedPlayers: ConfirmedPlayer[];
  matchId?: string;
}

const MatchReport: React.FC<
  Partial<MatchReportProps> & { soloLectura?: boolean }
> = (props) => {
  const params = useParams();
  const matchId = props.matchId || params.matchId;
  const location = useLocation();
  const confirmedPlayers =
    props.confirmedPlayers || location.state?.confirmedPlayers || [];
  const { data: match, isLoading } = useMatchById(matchId!);

  const { data: matchTournamentDetails } = useMatchTournamentDetails(matchId);
  const {
    data: registrations,
    isLoading: loadingStandings,
    isError: errorStandings,
  } = useRegistrationsByTournament(matchTournamentDetails?.tournamentId);

  const teamA = match?.teamA || { _id: "A", name: "Equipo A" };
  const teamB = match?.teamB || { _id: "B", name: "Equipo B" };
  const scoreA = match?.homeScore ?? 0;
  const scoreB = match?.awayScore ?? 0;
  // Mostrar todos los eventos, incluyendo los del sistema
  const events = match?.events || [];
  const date = formatDate(match?.date ?? "");
  const referee =
    typeof match?.refereeId === "object" && match.refereeId?.name
      ? match.refereeId.name
      : "No disponible";
  const veedor =
    typeof match?.viewerId === "object" && match.viewerId?.name
      ? match.viewerId.name
      : "No disponible";
  const field = match?.fieldNumber || "No disponible";
  // TODO: Traer datos reales de la tabla de posiciones
  const standings = [
    {
      pos: 1,
      team: teamA.name,
      pj: 5,
      g: 4,
      e: 1,
      p: 0,
      gf: 12,
      gc: 4,
      dg: "+8",
      pts: 13,
    },
    {
      pos: 2,
      team: teamB.name,
      pj: 5,
      g: 3,
      e: 1,
      p: 1,
      gf: 10,
      gc: 6,
      dg: "+4",
      pts: 10,
    },
  ];

  // Observaciones del veedor
  const { data: matchObservations, isLoading: loadingObs } =
    useMatchObservations(matchId);
  const updateObsMutation = useUpdateMatchObservations();

  // Estado local para observaciones, inicializado con datos del backend
  const [quejas, setQuejas] = useState("");
  const [arbitro, setArbitro] = useState("");
  const [roja, setRoja] = useState("");
  // Estado local para feedback visual
  const [obsStatus, setObsStatus] = useState<null | "success" | "error">(null);

  // Estados para edición de eventos
  const [editingEvent, setEditingEvent] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    type: "",
    minute: 0,
    team: "TeamA" as "TeamA" | "TeamB",
    playerId: "",
  });

  const { mutate: updateEvent, isPending: isUpdating } = useUpdateMatchEvent();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteMatchEvent();

  // Función para obtener el índice original (ahora es directo ya que mostramos todos los eventos)
  const getOriginalEventIndex = (displayIndex: number): number => {
    return displayIndex;
  };

  // Funciones para edición de eventos
  const handleEditEvent = (eventIndex: number, event: any) => {
    setEditingEvent(eventIndex);
    setEditForm({
      type: event.type,
      minute: event.minute || 0,
      team: event.team || "TeamA",
      playerId: event.playerId || "",
    });
  };

  const handleSaveEdit = () => {
    if (editingEvent !== null && matchId) {
      const originalIndex = getOriginalEventIndex(editingEvent);
      if (originalIndex !== -1) {
        updateEvent({
          matchId,
          eventIndex: originalIndex,
          data: editForm,
        });
        setEditingEvent(null);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventIndex: number) => {
    if (
      matchId &&
      window.confirm("¿Estás seguro de que quieres eliminar este evento?")
    ) {
      const originalIndex = getOriginalEventIndex(eventIndex);
      if (originalIndex !== -1) {
        deleteEvent({
          matchId,
          eventIndex: originalIndex,
        });
      }
    }
  };

  // Estado local para saber si hubo cambios
  const [obsDirty, setObsDirty] = useState(false);

  React.useEffect(() => {
    if (matchObservations) {
      setQuejas(matchObservations.complaints || "");
      setArbitro(matchObservations.refereeEvaluation || "");
      setRoja(matchObservations.redCardReport || "");
    }
  }, [matchObservations]);

  // Al cambiar un campo, solo actualiza el estado local y marca como "dirty"
  const handleObsChange = (
    field: "complaints" | "refereeEvaluation" | "redCardReport",
    value: string
  ) => {
    if (soloLectura) return;
    if (field === "complaints") setQuejas(value);
    if (field === "refereeEvaluation") setArbitro(value);
    if (field === "redCardReport") setRoja(value);
    setObsDirty(true);
  };

  // Guardar observaciones al hacer click en el botón
  const handleSaveObservations = () => {
    if (!obsDirty || soloLectura) return;
    updateObsMutation.mutate(
      {
        matchId: matchId!,
        data: {
          complaints: quejas,
          refereeEvaluation: arbitro,
          redCardReport: roja,
        },
      },
      {
        onSuccess: () => {
          setObsStatus("success");
          setObsDirty(false);
          setTimeout(() => setObsStatus(null), 1500);
        },
        onError: () => {
          setObsStatus("error");
          setTimeout(() => setObsStatus(null), 2000);
        },
      }
    );
  };

  const completeMatchMutation = useCompleteMatch();
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const soloLectura =
    props.soloLectura || match?.status === MatchStatus.COMPLETED;

  const queryClient = useQueryClient();

  // Obtener viewerId para navegación
  let viewerIdNav = null;
  if (
    match?.viewerId &&
    typeof match.viewerId === "object" &&
    match.viewerId._id
  ) {
    viewerIdNav = match.viewerId._id;
  } else if (location.state?.viewerId) {
    viewerIdNav = location.state.viewerId;
  }

  const handleConfirmMatch = async () => {
    if (!matchId) return;
    try {
      await completeMatchMutation.mutateAsync({ matchId });
      setShowSuccess(true);
      // Refrescar datos del partido para ver el estado actualizado
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    } catch (e) {
      alert("Error al confirmar la ficha. Intenta nuevamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">Cargando ficha del partido...</div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-10 text-red-600">
        No se encontró el partido.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl my-10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white px-10 py-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-white hover:text-gray-300 transition-colors"
            title="Volver"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-8-7 8-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-light mb-1">
              Ficha Final del Partido
            </h1>
            <div className="text-lg opacity-90">
              {teamA.name} vs {teamB.name}
            </div>
          </div>
        </div>
        {soloLectura ? (
          <div className="bg-green-500/90 text-white px-6 py-3 rounded-xl text-lg font-bold uppercase tracking-wider shadow">
            CONFIRMADO
          </div>
        ) : (
          <div className="bg-yellow-400/80 text-white px-6 py-3 rounded-xl text-lg font-bold uppercase tracking-wider shadow">
            Pendiente de Confirmación
          </div>
        )}
      </div>

      <div className="p-8">
        {/* Resumen del Partido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow flex flex-col">
            <div className="text-xl font-semibold mb-4 text-center">
              Resumen del Partido
            </div>
            <div className="grid grid-cols-3 gap-4 items-center mb-6">
              <div className="text-center border-2 border-blue-400 rounded-xl bg-blue-50 p-4">
                <div className="font-semibold mb-2">{teamA.name}</div>
                <div className="text-3xl font-bold">{scoreA}</div>
              </div>
              <div className="text-2xl font-bold text-gray-600 text-center">
                VS
              </div>
              <div className="text-center border-2 border-red-400 rounded-xl bg-red-50 p-4">
                <div className="font-semibold mb-2">{teamB.name}</div>
                <div className="text-3xl font-bold">{scoreB}</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Fecha:</span>{" "}
                  <span>{date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Árbitro:</span>{" "}
                  <span>{referee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Veedor:</span>{" "}
                  <span>{veedor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Cancha:</span>{" "}
                  <span>{field}</span>
                </div>
              </div>
            </div>
            {/* Eliminar botón Editar Datos del Partido */}
            {/* <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-xl w-full mt-2">
              ✏️ Editar Datos del Partido
            </button> */}
          </div>

          {/* Eventos del Partido */}
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow flex flex-col">
            <div className="text-xl font-semibold mb-4 text-center">
              Eventos del Partido
            </div>
            <div className="max-h-64 overflow-y-auto mb-4">
              {events.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No hay eventos registrados
                </div>
              ) : (
                <ul className="space-y-2">
                  {events.map((event: any, idx: number) => {
                    let playerName = "-";
                    let jerseyNumber = null;
                    let teamName = "";
                    if (event.team === "TeamA") teamName = teamA.name;
                    else if (event.team === "TeamB") teamName = teamB.name;
                    if (event.player) {
                      playerName =
                        event.player.name || event.player.user?.name || "-";
                      jerseyNumber = event.player.jerseyNumber;
                    } else {
                      const player = confirmedPlayers.find(
                        (p: ConfirmedPlayer) => p.playerId === event.playerId
                      );
                      if (player) {
                        playerName = player.name;
                        jerseyNumber = player.jerseyNumber;
                        if (!teamName && player.teamId === teamA._id)
                          teamName = teamA.name;
                        if (!teamName && player.teamId === teamB._id)
                          teamName = teamB.name;
                      }
                    }
                    let cardEmoji = "";
                    if (event.type === "yellowCard") cardEmoji = "🟨";
                    if (event.type === "blueCard") cardEmoji = "🟦";
                    if (event.type === "redCard") cardEmoji = "🟥";

                    return (
                      <li
                        key={idx}
                        className="border rounded p-3 flex flex-col md:flex-row md:items-center gap-2"
                      >
                        {editingEvent === idx ? (
                          // Modo edición
                          <div className="w-full space-y-2">
                            <div className="flex flex-wrap gap-2 items-center">
                              <select
                                value={editForm.type}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    type: e.target.value,
                                  })
                                }
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="goal">Gol</option>
                                <option value="yellowCard">
                                  Tarjeta Amarilla
                                </option>
                                <option value="redCard">Tarjeta Roja</option>
                                <option value="blueCard">Tarjeta Azul</option>
                                <option value="start_first_half">
                                  Inicio Primer Tiempo
                                </option>
                                <option value="end_first_half">
                                  Fin Primer Tiempo
                                </option>
                                <option value="start_second_half">
                                  Inicio Segundo Tiempo
                                </option>
                                <option value="end_second_half">
                                  Fin Segundo Tiempo
                                </option>
                              </select>
                              <input
                                type="number"
                                value={editForm.minute}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    minute: parseInt(e.target.value) || 0,
                                  })
                                }
                                placeholder="Minuto"
                                className="border rounded px-2 py-1 text-sm w-20"
                              />
                              <select
                                value={editForm.team}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    team: e.target.value as "TeamA" | "TeamB",
                                  })
                                }
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="TeamA">{teamA.name}</option>
                                <option value="TeamB">{teamB.name}</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                disabled={isUpdating}
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                              >
                                {isUpdating ? "Guardando..." : "Guardar"}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Modo visualización
                          <>
                            {[
                              "start_first_half",
                              "end_first_half",
                              "start_second_half",
                              "end_second_half",
                            ].includes(event.type) ? (
                              // Eventos del sistema
                              <span className="italic text-gray-600">
                                {translateEventType(event.type)}:{" "}
                                {event.timestamp
                                  ? new Date(
                                      event.timestamp
                                    ).toLocaleTimeString("es-AR", {
                                      timeZone:
                                        "America/Argentina/Buenos_Aires",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                              </span>
                            ) : (
                              // Eventos normales
                              <>
                                <span className="font-bold">
                                  [{translateEventType(event.type)}]
                                </span>
                                <span className="text-gray-500">
                                  {event.minute}'
                                </span>
                                <span>
                                  {(event.type === "yellowCard" ||
                                    event.type === "blueCard" ||
                                    event.type === "redCard") &&
                                    cardEmoji}{" "}
                                  {playerName}
                                  {jerseyNumber && ` (#${jerseyNumber})`}
                                  {teamName && (
                                    <span>
                                      {" "}
                                      de <b>{teamName}</b>
                                    </span>
                                  )}
                                </span>
                              </>
                            )}

                            {/* Botones de acción - solo si no es solo lectura */}
                            {!soloLectura && (
                              <div className="flex gap-1 ml-auto">
                                <button
                                  onClick={() => handleEditEvent(idx, event)}
                                  className="text-gray-400 hover:text-blue-500 transition-colors duration-200 p-1 rounded"
                                  title="Editar evento"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(idx)}
                                  disabled={isDeleting}
                                  className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded disabled:opacity-50"
                                  title="Eliminar evento"
                                >
                                  {isDeleting ? (
                                    <svg
                                      className="w-4 h-4 animate-spin"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Observaciones del Veedor */}
        <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow mb-8">
          <div className="text-xl font-semibold mb-4 text-center">
            Observaciones del Veedor
          </div>
          {loadingObs ? (
            <div className="text-center py-6 text-gray-500">
              Cargando observaciones...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="font-semibold mb-2">📝 Quejas</div>
                  <textarea
                    className="w-full min-h-[80px] p-2 border-2 border-gray-200 rounded-lg"
                    placeholder="Registrar quejas de equipos o incidentes..."
                    value={quejas}
                    onChange={(e) =>
                      handleObsChange("complaints", e.target.value)
                    }
                    disabled={soloLectura}
                  />
                </div>
                <div>
                  <div className="font-semibold mb-2">
                    ⚖️ Evaluación Arbitral
                  </div>
                  <textarea
                    className="w-full min-h-[80px] p-2 border-2 border-gray-200 rounded-lg"
                    placeholder="Evaluación del desempeño del árbitro..."
                    value={arbitro}
                    onChange={(e) =>
                      handleObsChange("refereeEvaluation", e.target.value)
                    }
                    disabled={soloLectura}
                  />
                </div>
                <div>
                  <div className="font-semibold mb-2">
                    🟥 Informe de Tarjeta Roja
                  </div>
                  <textarea
                    className="w-full min-h-[80px] p-2 border-2 border-gray-200 rounded-lg"
                    placeholder="Detalles de tarjetas rojas mostradas..."
                    value={roja}
                    onChange={(e) =>
                      handleObsChange("redCardReport", e.target.value)
                    }
                    disabled={soloLectura}
                  />
                </div>
              </div>
              {/* Botón de guardar y feedback visual */}
              {!soloLectura && (
                <div className="flex flex-col items-center mt-4">
                  <button
                    className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed`}
                    onClick={handleSaveObservations}
                    disabled={!obsDirty || updateObsMutation.isPending}
                  >
                    💾 Guardar observaciones
                  </button>
                </div>
              )}
              {obsStatus === "success" && (
                <div className="mt-4 text-green-600 text-center font-semibold">
                  ✔ Guardado
                </div>
              )}
              {obsStatus === "error" && (
                <div className="mt-4 text-red-600 text-center font-semibold">
                  ✖ Error al guardar
                </div>
              )}
            </>
          )}
        </div>

        {/* Confirmación y Navegación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow flex flex-col col-span-2">
            {soloLectura ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-3xl font-bold text-green-600 mb-2 text-center">
                  PARTIDO CONFIRMADO
                </div>
              </div>
            ) : (
              <>
                <div className="text-lg font-semibold mb-2 text-center">
                  Confirmación Final
                </div>
                <div className="text-gray-600 mb-4 text-center">
                  Revisa junto con el árbitro todos los datos del partido,
                  eventos y observaciones. Una vez confirmada, la ficha no podrá
                  ser modificada y se actualizarán las estadísticas oficiales.
                </div>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl w-full"
                  onClick={handleConfirmMatch}
                  disabled={
                    completeMatchMutation.isPending ||
                    showSuccess ||
                    soloLectura
                  }
                >
                  ✅ Confirmar Ficha Final
                </button>
                <div className="hidden mt-4 bg-green-100 text-green-700 font-bold py-3 px-6 rounded-xl text-center">
                  ✅ Ficha Confirmada
                </div>
              </>
            )}
          </div>
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow flex flex-col ">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-xl w-full mb-2"
              onClick={() => {
                if (viewerIdNav) {
                  navigate(`/match/viewerFlow`);
                } else {
                  navigate("/match/viewerFlow");
                }
              }}
            >
              📋 Mis Partidos
            </button>
          </div>
        </div>

        {/* Tabla de Posiciones */}
        <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow mb-8 opacity-80">
          <div className="text-lg font-semibold mb-4 text-center">
            Tabla de Posiciones Actualizada
          </div>
          <div className="overflow-x-auto">
            {loadingStandings ? (
              <div className="text-center py-6 text-gray-500">
                Cargando tabla de posiciones...
              </div>
            ) : errorStandings ? (
              <div className="text-center py-6 text-red-500">
                Error al cargar la tabla de posiciones
              </div>
            ) : registrations && registrations.length > 0 ? (
              <StandingsTable registrations={registrations} />
            ) : (
              <div className="text-center py-6 text-gray-500">
                No hay datos de posiciones para este torneo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchReport;
