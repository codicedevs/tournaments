import { PositionTable } from "../components/PositionTable";
import { TopScorers } from "../components/TopScorers";
import { MobileNavigation } from "../components/MobileNavigation";
import { useEffect, useState } from "react";
import { api, Match, matchesApi } from "../api/http";
import type { Tournament } from "../api/http";

export function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] =
    useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch tournaments on mount
    api.tournaments
      .getAll()
      .then(setTournaments)
      .catch((err) => console.error("Error fetching tournaments", err));
  }, []);

  useEffect(() => {
    if (!selectedTournamentId) {
      setMatches([]);
      return;
    }
    console.log(selectedTournamentId, "selectedTournamentId");
    setLoadingMatches(true);
    matchesApi
      .getAll()
      .then((data) => {
        console.log(data);
        const filtered = data.filter(
          (m) =>
            // backend populates nested objects
            (m as any)?.matchDayId?.phaseId?.tournamentId._id ===
            selectedTournamentId?.id
        );
        setMatches(filtered);
        console.log(filtered, "filtered");
      })
      .catch(() => setMatchesError("Error al obtener partidos"))
      .finally(() => setLoadingMatches(false));
  }, [selectedTournamentId]);

  return (
    <div className="bg-gray-50 min-h-screen w-full pb-16 md:pb-0">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* Tournament selector */}
        <div className="mb-6">
          <label
            htmlFor="tournament-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Selecciona un torneo
          </label>
          <select
            id="tournament-select"
            value={selectedTournamentId?.id}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">-- Seleccione --</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {loadingMatches && selectedTournamentId && (
          <p className="text-center">Cargando partidos...</p>
        )}

        {matchesError && (
          <p className="text-center text-red-600">{matchesError}</p>
        )}

        {!loadingMatches && matches.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6">
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold text-indigo-700 flex items-center">
                <span className="w-1 h-6 bg-indigo-600 rounded mr-3"></span>
                Partidos del torneo
              </h2>
            </div>
            <div className="grid gap-4">
              {matches.map((match) => (
                <article
                  key={match.id}
                  className="border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center text-gray-500 text-sm mb-2">
                    <span>{new Date(match.date).toLocaleDateString()}</span>
                    <span>
                      {new Date(match.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold flex-1 text-center truncate">
                      {match.teamA.name}
                    </span>
                    <span className="mx-3 font-bold text-gray-600">VS</span>
                    <span className="font-semibold flex-1 text-center truncate">
                      {match.teamB.name}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Additional widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <PositionTable />
          <TopScorers />
        </div>
      </main>
      {/* Only visible on mobile */}
      <MobileNavigation />
    </div>
  );
}
