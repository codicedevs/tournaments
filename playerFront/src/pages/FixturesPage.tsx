import { useEffect, useState } from "react";
import {
  tournamentsApi,
  matchdaysApi,
  Tournament,
  Matchday,
  Match,
} from "../api/http";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { WelcomeDivisionSelector } from "../components/WelcomeDivisionSelector";

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
        // Preselect the first tournament so the page shows fixture data by default
        if (data.length > 0) {
          setSelectedTournamentId(data[0]._id);
        }
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
          <span>{new Date(match.date).toLocaleDateString("es-AR")}</span>
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeDivisionSelector
        title="Fixture de Partidos"
        description="Consulta todos los partidos programados y resultados de tu división"
        tournaments={tournaments}
        selectedTournamentId={selectedTournamentId}
        onTournamentChange={setSelectedTournamentId}
      />

      {/* Content Section */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden p-6 max-w-4xl mx-auto space-y-6">
        {loading && <p>Cargando jornadas...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {/* Matchdays List */}
        {!loading && !error && matchdays.length > 0 && (
          <div className="space-y-4">
            {matchdays.map((md) => (
              <details
                key={md._id}
                className="border border-gray-200 rounded-lg"
              >
                <summary className="font-semibold p-4 cursor-pointer select-none flex items-center justify-between">
                  <span>
                    Jornada {md.order}
                    {md.date &&
                      ` - ${new Date(md.date).toLocaleDateString("es-AR")}`}
                  </span>
                  <span className="text-sm text-gray-500">Ver partidos</span>
                </summary>
                <div className="grid gap-4 p-4 border-t border-gray-100">
                  {md.matches?.length ? (
                    md.matches.map((m) => renderMatch(m as Match))
                  ) : (
                    <p>No hay partidos</p>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
