import { useEffect, useState } from "react";
import { registrationApi, Registration } from "../api/http";

interface PositionTableProps {
  tournamentId: string | undefined;
}

export function PositionTable({ tournamentId }: PositionTableProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) {
      setRegistrations([]);
      return;
    }

    setLoading(true);
    registrationApi
      .getByTournament(tournamentId)
      .then((data) => {
        const sorted = data.sort(
          (a, b) =>
            b.stats.points - a.stats.points ||
            b.stats.goalDifference - a.stats.goalDifference
        );
        setRegistrations(sorted);
      })
      .catch(() =>
        setError("Ocurrió un error al obtener la tabla de posiciones.")
      )
      .finally(() => setLoading(false));
  }, [tournamentId]);

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-black flex items-center">
          <span className="w-1 h-6 bg-black rounded mr-3"></span>
          Tabla de posiciones
        </h2>
      </div>

      {!tournamentId && (
        <p className="p-6 text-center text-gray-500">
          Selecciona un torneo para ver la tabla de posiciones.
        </p>
      )}

      {loading && tournamentId && (
        <p className="p-6 text-center text-gray-500">Cargando...</p>
      )}

      {error && <p className="p-6 text-center text-red-600">{error}</p>}

      {!loading && !error && registrations.length === 0 && tournamentId && (
        <p className="p-6 text-center text-gray-500">
          Todavía no hay registros para este torneo.
        </p>
      )}

      {!loading && registrations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-gray-500">#</th>
                <th className="px-6 py-3 text-gray-500">Equipo</th>
                <th className="px-6 py-3 text-gray-500 text-center">PJ</th>
                <th className="px-6 py-3 text-gray-500 text-center">G</th>
                <th className="px-6 py-3 text-gray-500 text-center">E</th>
                <th className="px-6 py-3 text-gray-500 text-center">P</th>
                <th className="px-6 py-3 text-gray-500 text-center">DG</th>
                <th className="px-6 py-3 text-gray-500 text-center">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registrations.map((reg, idx) => {
                const stats = reg.stats;
                const teamName = (reg as any).teamId?.name || (reg as any).teamId || "--";
                const played = stats.wins + stats.draws + stats.losses;
                return (
                  <tr key={reg._id || idx}>
                    <td className="px-6 py-4">{idx + 1}</td>
                    <td className="px-6 py-4 font-medium">{teamName}</td>
                    <td className="px-6 py-4 text-center">{played}</td>
                    <td className="px-6 py-4 text-center">{stats.wins}</td>
                    <td className="px-6 py-4 text-center">{stats.draws}</td>
                    <td className="px-6 py-4 text-center">{stats.losses}</td>
                    <td className="px-6 py-4 text-center">{stats.goalDifference}</td>
                    <td className="px-6 py-4 text-center font-bold">{stats.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
