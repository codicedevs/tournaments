import React, { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { Match, MatchEvent, MatchEventType } from "../../models/Match";

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

  const handleSave = () => {
    if (minute > 0) {
      onSave({
        type: selectedType,
        minute,
        team: selectedTeam,
      });
    }
  };

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
        onChange={(e) => setSelectedTeam(e.target.value as "TeamA" | "TeamB")}
        className="px-2 py-1 border rounded"
      >
        <option value="TeamA">{match.teamA.name}</option>
        <option value="TeamB">{match.teamB.name}</option>
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
  const getEventIcon = (type: MatchEventType) => {
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
    const teamName = event.team === "TeamA" ? teamA.name : teamB.name;
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
