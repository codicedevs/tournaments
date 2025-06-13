import React from "react";
import { PlusIcon } from "lucide-react";
import { Matchday } from "../../models/Matchday";
import MatchdayItem from "./MatchdayItem";

interface CalendarSectionProps {
  matchdays: Matchday[];
  expandedMatchdays: Record<string, boolean>;
  onToggleMatchday: (matchdayId: string) => void;
  onGenerateFixture: () => void;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({
  matchdays,
  expandedMatchdays,
  onToggleMatchday,
  onGenerateFixture,
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Calendario</h2>
        <button
          onClick={onGenerateFixture}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon size={16} className="mr-1" />
          Generar Calendario
        </button>
      </div>

      {matchdays.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4">
            No hay jornadas definidas para esta fase.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {matchdays.map((matchday) => (
            <MatchdayItem
              key={matchday._id}
              matchday={matchday}
              isExpanded={!!expandedMatchdays[matchday._id]}
              onToggle={() => onToggleMatchday(matchday._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarSection;
