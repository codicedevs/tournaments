import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import {
  PlusIcon,
  ArrowLeftIcon,
  EyeIcon,
  CalendarIcon,
  UsersIcon,
} from "lucide-react";
import { useTournaments } from "../api/tournamentHooks";

const TournamentList: React.FC = () => {
  const navigate = useNavigate();
  const { data: tournaments = [], isLoading, isError } = useTournaments();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver al Panel</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Torneos</h1>
            <p className="text-gray-600">Gestiona los torneos disponibles</p>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Torneos</h1>
            <p className="text-gray-600">Gestiona los torneos disponibles</p>
          </div>
          <button
            onClick={() => navigate("/tournaments/new")}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            <PlusIcon size={18} />
            <span>Crear Torneo</span>
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando torneos...</p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 mb-4">
              Error al cargar los torneos. Inténtelo de nuevo más tarde.
            </p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No hay torneos disponibles.</p>
            <button
              onClick={() => navigate("/tournaments/new")}
              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              <PlusIcon size={18} />
              <span>Crear Primer Torneo</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tournaments.map((tournament) => (
                  <tr key={tournament._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tournament._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tournament.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() =>
                          navigate(
                            `/tournaments/${tournament._id}/registrations`
                          )
                        }
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 mr-4"
                      >
                        <UsersIcon size={16} />
                        <span>Equipos</span>
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/tournaments/${tournament._id}/fixture`)
                        }
                        className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 mr-4"
                      >
                        <EyeIcon size={16} />
                        <span>Ver Calendario</span>
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/tournaments/${tournament._id}/fixtures/new`
                          )
                        }
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <CalendarIcon size={16} />
                        <span>Generar Calendario</span>
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

export default TournamentList;
