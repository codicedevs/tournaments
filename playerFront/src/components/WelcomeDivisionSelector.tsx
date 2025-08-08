import { ChevronDownIcon, TrophyIcon } from "lucide-react";
import { Tournament } from "../api/http";

interface WelcomeDivisionSelectorProps {
  title: string;
  description: string;
  tournaments: Tournament[];
  selectedTournamentId: string;
  onTournamentChange: (tournamentId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function WelcomeDivisionSelector({
  title,
  description,
  tournaments,
  selectedTournamentId,
  onTournamentChange,
  loading = false,
  error = null,
}: WelcomeDivisionSelectorProps) {
  return (
    <div className="text-black rounded-lg p-1 px-4 sm:px-6">
      <div className="max-w-full sm:max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <TrophyIcon className="w-12 h-12 text-orange-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight break-words">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-black mb-6 leading-relaxed">
          {description}
        </p>

        {/* Division Selector */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 max-w-full sm:max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
            <span>🏆</span>
            Selecciona tu División
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span className="ml-2">Cargando divisiones...</span>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-300 rounded-lg p-3">
              <p className="text-red-100">{error}</p>
            </div>
          ) : (
            <div className="relative">
              <select
                id="tournament"
                className="w-full bg-white text-gray-800 border-0 rounded-lg px-4 py-3 pr-10 text-lg font-medium shadow-lg appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-200"
                value={selectedTournamentId}
                onChange={(e) => onTournamentChange(e.target.value)}
              >
                <option value="" className="text-gray-500">
                  -- Elige una división --
                </option>
                {tournaments.map((t) => (
                  <option key={t._id} value={t._id} className="text-gray-800">
                    {t.name} - {t.season}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
