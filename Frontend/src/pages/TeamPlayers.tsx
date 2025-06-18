import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useTeam } from "../api/teamHooks";

const TeamPlayers: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const { data: team } = useTeam(teamId || "");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/teams")}
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
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No hay jugadores en este equipo.</p>
          <button
            onClick={() => navigate(`/teams/${teamId}/players/register`)}
            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            <PlusIcon size={18} />
            <span>Agregar Primer Jugador</span>
          </button>
        </div>
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
          </table>
        </div>
      </main>
    </div>
  );
};

export default TeamPlayers;
