import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  Player,
  Event,
  ConfirmedPlayer,
  MatchOnProps,
} from "../interfaces/interfaces.match";
import { formatTime } from "../utils/functions";
import {
  useMatchById,
  useUpdateMatch,
  useUpdateMatchEvent,
  useDeleteMatchEvent,
} from "../api/matchHooks";
import type { Team } from "../models/Match";
import { useNavigate } from "react-router-dom";
import { translateEventType } from "../utils/functions";
import ConfirmationModal from "../components/ConfirmationModal";

// ---------------------------------------------
// Componente independiente EventList
// Se define fuera de MatchOn para que React no lo desmonte
// en cada re-render del padre (causado por el cronómetro).

interface EventListProps {
  match: any;
  teamA: Team;
  teamB: Team;
}

const EventList: React.FC<EventListProps> = React.memo(
  ({ match, teamA, teamB }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const savedScroll = useRef(0);
    const [editingEvent, setEditingEvent] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
      type: "",
      minute: 0,
      team: "TeamA" as "TeamA" | "TeamB",
      playerId: "",
    });

    const { mutate: updateEvent, isPending: isUpdating } =
      useUpdateMatchEvent();
    const { mutate: deleteEvent, isPending: isDeleting } =
      useDeleteMatchEvent();

    const startSecondHalfIndex = match?.events
      ? match.events.findIndex((e: any) => e.type === "start_second_half")
      : -1;

    const handleScroll = () => {
      if (listRef.current) savedScroll.current = listRef.current.scrollTop;
    };

    useLayoutEffect(() => {
      if (listRef.current) listRef.current.scrollTop = savedScroll.current;
    });

    // auto-scroll al fondo (solo si usuario estaba abajo)
    useEffect(() => {
      if (!listRef.current) return;
      const { clientHeight, scrollHeight } = listRef.current;
      const nearBottom =
        scrollHeight - (savedScroll.current + clientHeight) < 40;
      if (nearBottom) {
        savedScroll.current = scrollHeight;
        listRef.current.scrollTop = scrollHeight;
      }
    }, [match?.events?.length]);

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
      if (editingEvent !== null && match?._id) {
        updateEvent({
          matchId: match._id,
          eventIndex: editingEvent,
          data: editForm,
        });
        setEditingEvent(null);
      }
    };

    const handleCancelEdit = () => {
      setEditingEvent(null);
    };

    const handleDeleteEvent = (eventIndex: number) => {
      if (
        match?._id &&
        window.confirm("¿Estás seguro de que quieres eliminar este evento?")
      ) {
        deleteEvent({
          matchId: match._id,
          eventIndex,
        });
      }
    };

    return (
      <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow mb-8">
        <div className="text-xl font-semibold mb-4">Registro de Eventos</div>
        <div
          className="max-h-64 overflow-y-auto"
          ref={listRef}
          onScroll={handleScroll}
        >
          {!match?.events || match.events.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No hay eventos registrados
            </div>
          ) : (
            <ul className="space-y-2">
              {match.events.map((event: any, eventIndex: number) => (
                <li
                  key={event.id || event._id || event.timestamp}
                  className="border rounded p-3 flex flex-col md:flex-row md:items-center gap-2"
                >
                  {editingEvent === eventIndex ? (
                    // Modo edición
                    <div className="w-full space-y-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <select
                          value={editForm.type}
                          onChange={(e) =>
                            setEditForm({ ...editForm, type: e.target.value })
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="goal">Gol</option>
                          <option value="yellowCard">Tarjeta Amarilla</option>
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
                            ? new Date(event.timestamp).toLocaleTimeString(
                                "es-AR",
                                {
                                  timeZone: "America/Argentina/Buenos_Aires",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "N/A"}
                        </span>
                      ) : (
                        // Eventos normales
                        <>
                          <span className="font-bold">
                            [{translateEventType(event.type)}]
                          </span>
                          {typeof event.minute === "number" && (
                            <span className="text-gray-500">
                              {event.minute}'{' '}
                              {startSecondHalfIndex !== -1 && eventIndex > startSecondHalfIndex
                                ? "ST"
                                : "PT"}
                            </span>
                          )}
                          {event.type === "goal" && event.player && (
                            <span>
                              ⚽ Gol de{" "}
                              <b>{event.player.name || event.player.name}</b>
                              {event.player.jerseyNumber && (
                                <> (#{event.player.jerseyNumber})</>
                              )}
                              {event.team && (
                                <>
                                  {" "}
                                  para{" "}
                                  <b>
                                    {event.team === "TeamA"
                                      ? teamA.name
                                      : teamB.name}
                                  </b>
                                </>
                              )}
                            </span>
                          )}
                          {(event.type === "yellowCard" ||
                            event.type === "blueCard" ||
                            event.type === "redCard") &&
                            event.player && (
                              <span>
                                {event.type === "yellowCard" && "🟨"}
                                {event.type === "blueCard" && "🟦"}
                                {event.type === "redCard" && "🟥"} Tarjeta para{" "}
                                <b>
                                  {event.player.name || event.player.user?.name}
                                </b>
                                {event.player.jerseyNumber && (
                                  <> (#{event.player.jerseyNumber})</>
                                )}
                                {event.team && (
                                  <>
                                    {" "}
                                    de{" "}
                                    <b>
                                      {event.team === "TeamA"
                                        ? teamA.name
                                        : teamB.name}
                                    </b>
                                  </>
                                )}
                              </span>
                            )}
                        </>
                      )}
                      {/* Otros eventos */}
                      {![
                        "goal",
                        "card",
                        "start_first_half",
                        "end_first_half",
                        "start_second_half",
                        "end_second_half",
                      ].includes(event.type) &&
                        event.description && <span>{event.description}</span>}

                      {/* Botones de acción - para todos los eventos */}
                      {
                        <div className="flex gap-1 ml-auto">
                          <button
                            onClick={() => handleEditEvent(eventIndex, event)}
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
                            onClick={() => handleDeleteEvent(eventIndex)}
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
                      }
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
);

const MatchOn: React.FC<MatchOnProps> = ({
  matchId,
  confirmedPlayers,
  onBack,
}) => {
  // Estados principales
  const [matchStarted, setMatchStarted] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<1 | 2>(1);
  const [timer, setTimer] = useState(0); // en segundos
  const [timerRunning, setTimerRunning] = useState(false);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [firstHalfEnded, setFirstHalfEnded] = useState(false);
  const [secondHalfStarted, setSecondHalfStarted] = useState(false);
  const [matchEnded, setMatchEnded] = useState(false);
  // Elimino el estado local de eventos
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventType, setEventType] = useState<"goal" | "card" | null>(null);

  // Estados para el modal de evento
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away" | null>(
    null
  );
  const [selectedPlayer, setSelectedPlayer] = useState<ConfirmedPlayer | null>(
    null
  );
  const [selectedCardType, setSelectedCardType] = useState<
    "yellow" | "blue" | "red" | null
  >(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { mutate: sendEvent } = useUpdateMatch();
  const navigate = useNavigate();

  // Obtener datos del partido
  const { data: match, isPending } = useMatchById(matchId);

  // Separar jugadores por equipo
  const playersA = confirmedPlayers.filter(
    (p) => p.teamId === match?.teamA?._id
  );
  const playersB = confirmedPlayers.filter(
    (p) => p.teamId === match?.teamB?._id
  );

  // Nombres de equipos
  const teamA: Team = match?.teamA || { _id: "", name: "Equipo A" };
  const teamB: Team = match?.teamB || { _id: "", name: "Equipo B" };
  const refereeName =
    typeof match?.refereeId === "object" && match.refereeId?.name
      ? match.refereeId.name
      : null;
  const viewerName =
    typeof match?.viewerId === "object" && match.viewerId?.name
      ? match.viewerId.name
      : null;

  // Cronómetro: iniciar, pausar, resetear
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerRunning]);

  // Reset modal al abrir
  useEffect(() => {
    if (eventModalOpen) {
      setSelectedTeam(null);
      setSelectedPlayer(null);
      setSelectedCardType(null);
    }
  }, [eventModalOpen]);

  // Actualizar marcador en tiempo real según los eventos
  useEffect(() => {
    if (!match?.events) return;
    const home = match.events.filter(
      (e: any) => e.type === "goal" && e.team === "TeamA"
    ).length;
    const away = match.events.filter(
      (e: any) => e.type === "goal" && e.team === "TeamB"
    ).length;
    setHomeScore(home);
    setAwayScore(away);
  }, [match?.events]);

  // Verificar si el partido está en juego basándose en los eventos
  const isMatchInPlay = () => {
    if (!match?.events) return false;

    const hasStartedFirstHalf = match.events.some(
      (e: any) => e.type === "start_first_half"
    );
    const hasEndedFirstHalf = match.events.some(
      (e: any) => e.type === "end_first_half"
    );
    const hasStartedSecondHalf = match.events.some(
      (e: any) => e.type === "start_second_half"
    );
    const hasEndedSecondHalf = match.events.some(
      (e: any) => e.type === "end_second_half"
    );

    // El partido está en juego si:
    // 1. Comenzó el primer tiempo y no terminó, O
    // 2. Comenzó el segundo tiempo y no terminó
    return (
      (hasStartedFirstHalf && !hasEndedFirstHalf) ||
      (hasStartedSecondHalf && !hasEndedSecondHalf)
    );
  };

  // Jugadores según equipo seleccionado
  const playersForSelectedTeam =
    selectedTeam === "home"
      ? playersA
      : selectedTeam === "away"
      ? playersB
      : [];

  const handleRegisterSystemEvent = (
    type:
      | "start_first_half"
      | "end_first_half"
      | "start_second_half"
      | "end_second_half",
    minute: number = 0
  ) => {
    sendEvent({
      matchId,
      event: {
        type,
        minute,
      },
    });
  };

  const handleRegisterEvent = () => {
    if (!selectedTeam || !selectedPlayer) return;
    const minute = Math.floor(timer / 60);
    const backendTeam = selectedTeam === "home" ? "TeamA" : "TeamB";
    if (eventType === "goal") {
      sendEvent({
        matchId,
        event: {
          type: "goal",
          team: backendTeam,
          playerId: selectedPlayer.playerId,
          minute,
        },
      });
    } else if (eventType === "card" && selectedCardType) {
      let cardEventType: "yellowCard" | "redCard" | "blueCard" = "yellowCard";
      if (selectedCardType === "yellow") cardEventType = "yellowCard";
      if (selectedCardType === "red") cardEventType = "redCard";
      if (selectedCardType === "blue") cardEventType = "blueCard";
      sendEvent({
        matchId,
        event: {
          type: cardEventType,
          team: backendTeam,
          playerId: selectedPlayer.playerId,
          minute,
        },
      });
    }
    setEventModalOpen(false);
  };

  // --- Subcomponentes ---

  // Header
  const Header = () => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-700 text-white px-10 py-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-light mb-1">Control de Partido</h1>
        <div className="text-lg opacity-90">
          {teamA.name} vs {teamB.name}
        </div>
        {(refereeName || viewerName) && (
          <div className="text-sm text-gray-300 mt-1">
            {refereeName && <span>Árbitro: {refereeName}</span>}
            {refereeName && viewerName && <span className="mx-2">|</span>}
            {viewerName && <span>Veedor: {viewerName}</span>}
          </div>
        )}
      </div>
      <button
        className="bg-white/20 text-white px-6 py-3 rounded-xl text-lg hover:bg-white/30 transition"
        onClick={() => onBack(secondHalfStarted)}
      >
        ← Gestión Jugadores
      </button>
    </div>
  );

  // ScoreBoard
  const ScoreBoard = () => (
    <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow mb-8">
      {!matchStarted ? (
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">¿Listo para comenzar?</div>
          <div className="text-lg text-gray-600 mb-6">
            {teamA.name} vs {teamB.name}
          </div>
          <button
            className="bg-gradient-to-br from-green-500 to-green-400 text-white px-10 py-4 rounded-xl text-xl font-bold uppercase tracking-wider shadow-lg hover:-translate-y-1 hover:shadow-2xl transition"
            onClick={() => {
              setMatchStarted(true);
              setTimer(0);
              setTimerRunning(true);
              setCurrentPeriod(1);
              setHomeScore(0);
              setAwayScore(0);
              handleRegisterSystemEvent("start_first_half");
            }}
          >
            ⚽ Iniciar Partido
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8 items-center max-w-xl mx-auto">
          <div className="w-40 h-40 flex flex-col justify-center items-center border-4 border-blue-400 rounded-xl bg-blue-50">
            <div className="text-lg font-semibold mb-2 text-center truncate w-full">
              {teamA.name}
            </div>
            <div className="text-4xl font-bold">{homeScore}</div>
          </div>
          <div className="text-2xl font-bold text-gray-600 text-center">VS</div>
          <div className="w-40 h-40 flex flex-col justify-center items-center border-4 border-red-400 rounded-xl bg-red-50">
            <div className="text-lg font-semibold mb-2 text-center truncate w-full">
              {teamB.name}
            </div>
            <div className="text-4xl font-bold">{awayScore}</div>
          </div>
        </div>
      )}
    </div>
  );

  // TimerControls
  const TimerControls = () => (
    <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow mb-8 flex flex-col items-center">
      <div className="bg-gradient-to-br from-blue-400 to-purple-500 text-white px-6 py-2 rounded-full text-lg font-bold mb-4">
        {currentPeriod === 1 ? "Primer Tiempo" : "Segundo Tiempo"}
      </div>
      <div className="text-5xl font-mono font-bold mb-4">
        {formatTime(timer)}
      </div>
      <div className="flex gap-4">
        {!matchEnded && (
          <>
            {matchStarted && timerRunning && (
              <button
                className="bg-yellow-400 text-white px-4 py-2 rounded-lg font-bold"
                onClick={() => setTimerRunning(false)}
              >
                Pausar
              </button>
            )}
            {matchStarted && !timerRunning && (
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold"
                onClick={() => setTimerRunning(true)}
              >
                Reanudar
              </button>
            )}
            {matchStarted && (
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold"
                onClick={() => setResetModalOpen(true)}
              >
                Reset
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );

  // MatchActions
  const MatchActions = () => (
    <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow mb-8 flex flex-col items-center">
      <div className="text-xl font-semibold mb-4">Control del Partido</div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          className="bg-green-500 text-white py-3 rounded-xl font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={() => {
            setEventType("goal");
            setEventModalOpen(true);
          }}
          disabled={!isMatchInPlay()}
        >
          ⚽ Registrar Gol
        </button>
        <button
          className="bg-yellow-500 text-white py-3 rounded-xl font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={() => {
            setEventType("card");
            setEventModalOpen(true);
          }}
          disabled={!isMatchInPlay()}
        >
          🟨 Registrar Tarjeta
        </button>
        {matchStarted && !firstHalfEnded && (
          <button
            className="bg-red-500 text-white py-3 rounded-xl font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={() => setEndFirstHalfModalOpen(true)}
          >
            Terminar Primer Tiempo
          </button>
        )}
        {firstHalfEnded && !secondHalfStarted && (
          <button
            className="bg-blue-500 text-white py-3 rounded-xl font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={() => {
              handleRegisterSystemEvent("start_second_half");
              setTimer(0);
              setTimerRunning(true);
              setCurrentPeriod(2);
              setSecondHalfStarted(true);
            }}
          >
            Comenzar Segundo Tiempo
          </button>
        )}
        {secondHalfStarted && !matchEnded && (
          <button
            className="bg-red-700 text-white py-3 rounded-xl font-bold text-lg"
            onClick={() => setEndMatchModalOpen(true)}
          >
            Terminar Partido
          </button>
        )}
      </div>
    </div>
  );

  // Modal de evento ---
  const EventModal = () => (
    <div
      className={`fixed inset-0 bg-black/40 flex items-center justify-center z-50 ${
        eventModalOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <div className="text-xl font-bold mb-4">
          Registrar {eventType === "goal" ? "Gol" : "Tarjeta"}
        </div>
        {/* Tabs de equipo */}
        <div className="flex gap-4 mb-6">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold border-2 transition-colors ${
              selectedTeam === "home"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-gray-50"
            }`}
            onClick={() => setSelectedTeam("home")}
          >
            {teamA.name}
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold border-2 transition-colors ${
              selectedTeam === "away"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-gray-200 bg-gray-50"
            }`}
            onClick={() => setSelectedTeam("away")}
          >
            {teamB.name}
          </button>
        </div>
        {/* Lista de jugadores */}
        {selectedTeam && (
          <div className="mb-6 max-h-48 overflow-y-auto">
            {playersForSelectedTeam.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                No hay jugadores
              </div>
            ) : (
              <ul className="space-y-2">
                {playersForSelectedTeam.map((player) => (
                  <li
                    key={player.playerId}
                    className={`border rounded p-3 flex items-center gap-2 cursor-pointer transition-colors ${
                      selectedPlayer?.playerId === player.playerId
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <span className="font-bold">#{player.jerseyNumber}</span>
                    <span>{player.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {/* Selección de tipo de tarjeta */}
        {eventType === "card" && (
          <div className="mb-6">
            <div className="mb-2 font-semibold">Tipo de tarjeta:</div>
            <div className="flex gap-3">
              {["yellow", "blue", "red"].map((type) => (
                <button
                  key={type}
                  className={`px-4 py-2 rounded-lg border-2 font-bold transition-colors ${
                    selectedCardType === type
                      ? "border-yellow-500 bg-yellow-100"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() =>
                    setSelectedCardType(type as "yellow" | "blue" | "red")
                  }
                >
                  {type === "yellow" && "🟨 Amarilla"}
                  {type === "blue" && "🟦 Azul"}
                  {type === "red" && "🟥 Roja"}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Acciones */}
        <div className="flex justify-end gap-2 mt-8">
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded-lg"
            onClick={() => setEventModalOpen(false)}
          >
            Cancelar
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300"
            disabled={
              !selectedTeam ||
              !selectedPlayer ||
              (eventType === "card" && !selectedCardType)
            }
            onClick={handleRegisterEvent}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );

  // Estados para los modales de confirmación
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [endFirstHalfModalOpen, setEndFirstHalfModalOpen] = useState(false);
  const [endMatchModalOpen, setEndMatchModalOpen] = useState(false);

  // --- Render principal ---
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl my-10 overflow-hidden">
      <Header />
      <div className="p-8">
        <ScoreBoard />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TimerControls />
          <MatchActions />
        </div>
        {matchEnded && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="text-3xl font-bold text-green-700 mb-6">
              Partido Finalizado
            </div>
            <button
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow hover:bg-blue-700 transition"
              onClick={() => {
                navigate(`/match/${matchId}/report`, {
                  state: { confirmedPlayers },
                });
              }}
            >
              Ver ficha del partido
            </button>
          </div>
        )}
        {/* Se pasa match y nombres para reutilizar en EventList */}
        <EventList match={match} teamA={teamA} teamB={teamB} />

        <EventModal />

        {/* Modales de confirmación */}
        <ConfirmationModal
          open={resetModalOpen}
          title="Reiniciar Cronómetro"
          message="¿Reiniciar el cronómetro? Esta acción no se puede deshacer."
          onCancel={() => setResetModalOpen(false)}
          onConfirm={() => {
            setTimer(0);
            setTimerRunning(false);
            setResetModalOpen(false);
          }}
        />

        <ConfirmationModal
          open={endFirstHalfModalOpen}
          title="Finalizar Primer Tiempo"
          message="¿Seguro que quieres finalizar el primer tiempo?"
          onCancel={() => setEndFirstHalfModalOpen(false)}
          onConfirm={() => {
            handleRegisterSystemEvent("end_first_half", Math.floor(timer / 60));
            setTimer(0);
            setTimerRunning(false);
            setFirstHalfEnded(true);
            setEndFirstHalfModalOpen(false);
          }}
        />

        <ConfirmationModal
          open={endMatchModalOpen}
          title="Finalizar Partido"
          message="¿Seguro que quieres finalizar el partido?"
          onCancel={() => setEndMatchModalOpen(false)}
          onConfirm={() => {
            handleRegisterSystemEvent("end_second_half", Math.floor(timer / 60));
            setTimerRunning(false);
            setMatchEnded(true);
            setEndMatchModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};

export default MatchOn;
