import { useEffect, useState } from "react";
import { playersApi, Player } from "../api/http";
import { TargetIcon } from "lucide-react";

interface TopScorersProps {
  tournamentId: string | undefined;
}

export function TopScorers({ tournamentId }: TopScorersProps) {
  const [scorers, setScorers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) {
      setScorers([]);
      return;
    }

    setLoading(true);
    playersApi
      .getByTournament(tournamentId)
      .then((data) => {
        console.log(data);
        const sorted = data
          .sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0))
          .slice(0, 10); // solo los primeros 10
        setScorers(sorted);
      })
      .catch(() => setError("Ocurrió un error al obtener los goleadores."))
      .finally(() => setLoading(false));
  }, [tournamentId]);

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full mt-6">
      <div className="bg-white p-4">
        <h3 className="text-xl font-bold text-black flex items-center gap-2">
          <TargetIcon size={24} />
          Tabla de Goleadores
        </h3>
      </div>
      {!tournamentId && (
        <p className="p-6 text-center text-gray-500">
          Selecciona un torneo para ver los goleadores.
        </p>
      )}

      {loading && tournamentId && (
        <p className="p-6 text-center text-gray-500">Cargando...</p>
      )}

      {error && <p className="p-6 text-center text-red-600">{error}</p>}

      {!loading && scorers.length === 0 && tournamentId && !error && (
        <p className="p-6 text-center text-gray-500">
          Todavía no hay goleadores registrados para este torneo.
        </p>
      )}

      {!loading && scorers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-gray-500">#</th>
                <th className="px-6 py-3 text-gray-500">Jugador</th>
                <th className="px-6 py-3 text-gray-500">Equipo</th>
                <th className="px-6 py-3 text-gray-500 text-center">Goles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scorers.map((p, idx) => (
                <tr key={p._id || idx}>
                  <td className="px-6 py-4">{idx + 1}</td>
                  <td className="px-6 py-4 font-medium">
                    {(p as any).userId?.name || p.name || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {(p as any).teamId?.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-center font-bold">
                    {p.stats?.goals ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
