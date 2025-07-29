import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useDeletePlayerFromTeam } from "../api/playerHooks";
import { useTeam } from "../api/teamHooks";

const TeamPlayers: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team, isLoading, isError } = useTeam(teamId || "", true);

  // Usar directamente los jugadores del equipo que vienen con el populate
  const playersList = team?.players || [];

  const { mutate: deletePlayer, isPending: isDeleting } =
    useDeletePlayerFromTeam();

  const handleDeletePlayer = (playerId: string) => {
    if (!teamId) return;

    if (window.confirm("¿Estás seguro de eliminar este jugador del equipo?")) {
      deletePlayer(
        { teamId, playerId },
        {
          onError: (error) => {
            console.error("Error deleting player:", error);
            alert("Error al eliminar el jugador");
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/teams/")}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Jugadores de {team?.name}
            </h1>
            <p className="text-gray-600">Gestiona los jugadores del equipo</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex-1" />
          <button
            onClick={() => navigate(`/teams/${teamId}/players/register`)}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            <PlusIcon size={18} />
            <span>Agregar Jugador</span>
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Cargando jugadores...</p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 mb-4">Error al cargar jugadores.</p>
          </div>
        ) : playersList.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">
              No hay jugadores en este equipo.
            </p>
            <button
              onClick={() => navigate(`/teams/${teamId}/players/register`)}
              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              <PlusIcon size={18} />
              <span>Agregar Primer Jugador</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playersList.map((player: any) => (
                  <tr key={player._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {player.userId?.profilePicture ? (
                          <img
                            src={player.userId.profilePicture}
                            alt={player.userId.name}
                            className="h-10 w-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">
                              {player.userId?.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {player.userId?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {player.userId?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {player.userId?.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => navigate(`/players/${player._id}/edit`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        disabled={true}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player._id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900 disabled:text-red-300"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeamPlayers;
