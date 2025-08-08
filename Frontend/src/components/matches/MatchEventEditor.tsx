import React, { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { Match, MatchEvent, MatchEventType } from "../../models/Match";
import { useTeamPlayers } from "../../api/teamHooks";

interface MatchEventEditorProps {
  match: Match;
  onSave: (event: MatchEvent) => void;
  onCancel: () => void;
}

export const MatchEventEditor: React.FC<MatchEventEditorProps> = ({
  match,
  onSave,
  onCancel,
}) => {
  const [minute, setMinute] = useState<number>(0);
  const [selectedTeam, setSelectedTeam] = useState<"TeamA" | "TeamB">("TeamA");
  const [selectedType, setSelectedType] = useState<MatchEventType>(
    MatchEventType.GOAL
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

  // Obtener jugadores de cada equipo
  const { data: teamAPlayers = [] } = useTeamPlayers(match.teamA?._id);
  const { data: teamBPlayers = [] } = useTeamPlayers(match.teamB?._id);

  // Ahora cada player tiene playerId y user
  const playersA = teamAPlayers;
  const playersB = teamBPlayers;
  // Filtrar jugadores según el equipo seleccionado
  const currentTeamPlayers = selectedTeam === "TeamA" ? playersA : playersB;

  const handleSave = () => {
    if (minute > 0 && selectedPlayerId) {
      onSave({
        type: selectedType,
        minute,
        team: selectedTeam,
        playerId: selectedPlayerId, // Se envía el playerId al backend
      });
    }
  };

  if (teamAPlayers.length === 0 && teamBPlayers.length === 0) {
    return (
      <div className="text-red-600 text-sm">
        No hay jugadores registrados en ninguno de los equipos
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value as MatchEventType)}
        className="px-2 py-1 border rounded"
      >
        <option value={MatchEventType.GOAL}>⚽ Gol</option>
        <option value={MatchEventType.YELLOW_CARD}>🟨 Tarjeta Amarilla</option>
        <option value={MatchEventType.RED_CARD}>🟥 Tarjeta Roja</option>
        <option value={MatchEventType.BLUE_CARD}>🟦 Tarjeta Azul</option>
      </select>
      <select
        value={selectedTeam}
        onChange={(e) => {
          setSelectedTeam(e.target.value as "TeamA" | "TeamB");
          setSelectedPlayerId(""); // Resetear selección de jugador al cambiar equipo
        }}
        className="px-2 py-1 border rounded"
      >
        <option value="TeamA">{match.teamA?.name || "Sin equipo A"}</option>
        <option value="TeamB">{match.teamB?.name || "Sin equipo B"}</option>
      </select>
      <select
        value={selectedPlayerId}
        onChange={(e) => setSelectedPlayerId(e.target.value)}
        className="px-2 py-1 border rounded"
        disabled={currentTeamPlayers.length === 0}
      >
        <option value="">Seleccionar jugador</option>
        {currentTeamPlayers.map((player: any) => (
          <option key={player.playerId} value={player.playerId}>
            {player.user?.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        min="1"
        value={minute}
        onChange={(e) => setMinute(parseInt(e.target.value) || 0)}
        className="w-16 px-2 py-1 border rounded text-center"
        placeholder="Minuto"
      />
      <button
        onClick={handleSave}
        className="p-1 text-green-600 hover:text-green-800"
        title="Guardar"
        disabled={!selectedPlayerId || minute <= 0}
      >
        <CheckIcon size={16} />
      </button>
      <button
        onClick={onCancel}
        className="p-1 text-red-600 hover:text-red-800"
        title="Cancelar"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
};

interface MatchEventsListProps {
  events: MatchEvent[];
  teamA: any;
  teamB: any;
}

export const MatchEventsList: React.FC<MatchEventsListProps> = ({
  events,
  teamA,
  teamB,
}) => {
  const getEventIcon = (type: MatchEvent["type"]) => {
    switch (type) {
      case MatchEventType.GOAL:
        return "⚽";
      case MatchEventType.YELLOW_CARD:
        return "🟨";
      case MatchEventType.RED_CARD:
        return "🟥";
      case MatchEventType.BLUE_CARD:
        return "🟦";
      default:
        return "";
    }
  };

  const getEventText = (event: MatchEvent) => {
    const teamName = event.team === "TeamA" ? (teamA?.name || "Equipo A") : (teamB?.name || "Equipo B");
    switch (event.type) {
      case MatchEventType.GOAL:
        return `Gol para ${teamName}`;
      case MatchEventType.YELLOW_CARD:
        return `Tarjeta Amarilla para ${teamName}`;
      case MatchEventType.RED_CARD:
        return `Tarjeta Roja para ${teamName}`;
      case MatchEventType.BLUE_CARD:
        return `Tarjeta Azul para ${teamName}`;
      default:
        return "";
    }
  };

  return (
    <div className="mt-2 space-y-1">
      {events.map((event, index) => (
        <div key={index} className="text-sm text-gray-600">
          {getEventIcon(event.type)} {event.minute}' - {getEventText(event)}
        </div>
      ))}
    </div>
  );
};
