import { useEffect, useState } from "react";
import {
  tournamentsApi,
  matchdaysApi,
  Tournament,
  Matchday,
  Match,
} from "../api/http";
import { CalendarIcon, ClockIcon } from "lucide-react";

export function FixturesPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [matchdays, setMatchdays] = useState<Matchday[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tournaments on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await tournamentsApi.getAll();
        setTournaments(data);
      } catch {
        setError("Error obteniendo torneos");
      }
    })();
  }, []);

  // Fetch matchdays when tournament changes
  useEffect(() => {
    if (!selectedTournamentId) {
      setMatchdays([]);
      return;
    }

    const tournament = tournaments.find((t) => t._id === selectedTournamentId);
    const phaseId = tournament?.phases?.[0]?._id;
    if (!phaseId) {
      setError("El torneo seleccionado no tiene phaseId asociado.");
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const mds = await matchdaysApi.findByPhase(phaseId as string);
        setMatchdays(mds);
      } catch {
        setError("Error obteniendo jornadas");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedTournamentId, tournaments]);

  const renderMatch = (match: Match) => (
    <article
      key={match._id}
      className="border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-center text-gray-500 text-sm mb-2">
        <div className="flex items-center gap-1">
          <CalendarIcon size={16} />
          <span>{new Date(match.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon size={16} />
          <span>
            {new Date(match.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-semibold flex-1 text-center truncate">
          {(match as any).teamA?.name || "--"}
        </span>
        <span className="mx-3 font-bold text-gray-600">VS</span>
        <span className="font-semibold flex-1 text-center truncate">
          {(match as any).teamB?.name || "--"}
        </span>
      </div>
    </article>
  );

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-indigo-700 flex items-center">
          <span className="w-1 h-6 bg-indigo-600 rounded mr-3"></span>
          Fixture
        </h2>
      </div>

      {/* Tournament Select */}
      <div>
        <label htmlFor="tournament" className="block text-sm font-medium mb-1">
          Seleccionar torneo
        </label>
        <select
          id="tournament"
          className="border rounded px-3 py-2 w-full max-w-sm"
          value={selectedTournamentId}
          onChange={(e) => setSelectedTournamentId(e.target.value)}
        >
          <option value="">-- Seleccione --</option>
          {tournaments.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} - {t.season}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Cargando jornadas...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Matchdays List */}
      {!loading && !error && matchdays.length > 0 && (
        <div className="space-y-8">
          {matchdays.map((md) => (
            <div key={md._id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-4">
                Jornada {md.order}
                {md.date && ` - ${new Date(md.date).toLocaleDateString()}`}
              </h3>
              <div className="grid gap-4">
                {md.matches?.length ? (
                  md.matches.map((m) => renderMatch(m as Match))
                ) : (
                  <p>No hay partidos</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
