import React from "react";
import { usePlayersByTournament } from "../../api/playerHooks";

interface PlayersTableProps {
  tournamentId: string;
}

const PlayersTable: React.FC<PlayersTableProps> = ({ tournamentId }) => {
  const {
    data: players = [],
    isLoading,
    isError,
  } = usePlayersByTournament(tournamentId);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">Tabla de Jugadores</h2>
      {isLoading ? (
        <div className="text-gray-500 text-center py-8">
          Cargando jugadores...
        </div>
      ) : isError ? (
        <div className="text-red-500 text-center py-8">
          Error al cargar jugadores.
        </div>
      ) : players.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No hay jugadores para este torneo.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr>
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">Nombre</th>
                <th className="px-2 py-1">Equipo</th>
                <th className="px-2 py-1">Goles</th>
                {/* <th className="px-2 py-1">Amarillas</th>
                <th className="px-2 py-1">Rojas</th>
                <th className="px-2 py-1">Azules</th> */}
              </tr>
            </thead>
            <tbody>
              {players.map((player: any, idx: number) => (
                <tr key={player._id} className="border-t">
                  <td className="px-2 py-1">{idx + 1}</td>
                  <td className="px-2 py-1">{player.userId?.name || "-"}</td>
                  <td className="px-2 py-1">{player.teamId?.name || "-"}</td>
                  <td className="px-2 py-1">{player.stats?.goals ?? 0}</td>
                  {/* <td className="px-2 py-1">
                    {player.stats?.yellowCards ?? 0}
                  </td>
                  <td className="px-2 py-1">{player.stats?.redCards ?? 0}</td>
                  <td className="px-2 py-1">{player.stats?.blueCards ?? 0}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PlayersTable;
