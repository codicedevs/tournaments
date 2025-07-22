import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  useMatchById,
  useMatchTournamentDetails,
  useCompleteMatch,
  useMatchObservations,
  useUpdateMatchObservations,
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
  const events = (match?.events || []).filter(
    (event: any) =>
      ![
        "start_first_half",
        "end_first_half",
        "start_second_half",
        "end_second_half",
      ].includes(event.type)
  );
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
        <div>
          <h1 className="text-3xl font-light mb-1">Ficha Final del Partido</h1>
          <div className="text-lg opacity-90">
            {teamA.name} vs {teamB.name}
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
                        <span className="font-bold">
                          [{translateEventType(event.type)}]
                        </span>
                        <span className="text-gray-500">{event.minute}'</span>
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
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {!soloLectura && (
              <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-xl w-full mt-2">
                ✏️ Editar Eventos
              </button>
            )}
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
          <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow flex flex-col">
            <div className="text-lg font-semibold mb-2 text-center">
              Navegación
            </div>
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
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl w-full mb-2">
              📊 Reportes
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl w-full">
              ⚙️ Configuración
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
