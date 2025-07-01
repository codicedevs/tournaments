import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { PlusIcon, ArrowLeftIcon, EyeIcon, UsersIcon } from "lucide-react";
import { useTournaments, useDeleteTournament } from "../api/tournamentHooks";

const TournamentList: React.FC = () => {
  const navigate = useNavigate();
  const { data: tournaments = [], isLoading, isError } = useTournaments();
  const { mutate: deleteTournament, isPending: isDeleting } =
    useDeleteTournament();
  const [selected, setSelected] = React.useState<string[]>([]);

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selected.length === 0) return;
    if (!window.confirm("¿Seguro que deseas borrar los torneos seleccionados?"))
      return;
    selected.forEach((id) => deleteTournament(id));
    setSelected([]);
  };

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
          <div className="flex gap-2">
            {selected.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
              >
                Borrar seleccionados
              </button>
            )}
            <button
              onClick={() => navigate("/tournaments/new")}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
            >
              <PlusIcon size={18} />
              <span>Crear Torneo</span>
            </button>
          </div>
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
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        selected.length === tournaments.length &&
                        tournaments.length > 0
                      }
                      onChange={() => {
                        if (selected.length === tournaments.length)
                          setSelected([]);
                        else setSelected(tournaments.map((t) => t._id));
                      }}
                    />
                  </th>
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
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(tournament._id)}
                        onChange={() => handleSelect(tournament._id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tournament._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/tournaments/${tournament._id}`);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        {tournament.name}
                      </a>
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
                          navigate(`/tournaments/${tournament._id}`)
                        }
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <EyeIcon size={16} />
                        <span>Ver Detalles</span>
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
