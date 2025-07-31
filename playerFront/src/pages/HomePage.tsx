import { useEffect, useState } from "react";
import { tournamentsApi, Tournament } from "../api/http";
import { PositionTable } from "../components/PositionTable";

export function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] =
    useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    tournamentsApi
      .getAll()
      .then((data) => {
        setTournaments(data);
        // Preselect the first tournament so the page starts with data
        if (data.length > 0) {
          setSelectedTournamentId(data[0]._id);
        }
      })
      .catch(() =>
        setError("Ocurrió un error al obtener los torneos disponibles.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Filtra por el torneo que se te cante</h1>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="tournament">
          Seleccionar torneo
        </label>
        {loading ? (
          <p className="text-gray-500">Cargando torneos...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <select
            id="tournament"
            className="border border-gray-300 rounded px-3 py-2 w-full md:w-64"
            value={selectedTournamentId ?? ""}
            onChange={(e) =>
              setSelectedTournamentId(
                e.target.value === "" ? undefined : e.target.value
              )
            }
          >
            <option value="">-- Selecciona un torneo --</option>
            {tournaments.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} - {t.season}
              </option>
            ))}
          </select>
        )}
      </div>

      <PositionTable tournamentId={selectedTournamentId} />
    </div>
  );
}
