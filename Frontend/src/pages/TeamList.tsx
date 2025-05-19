import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { PlusIcon, ArrowLeftIcon, Trash2Icon, PencilIcon } from "lucide-react";
import { useTeams, useDeleteTeam, useDeleteTeams } from "../api/teamHooks";
import { Team } from "../models";

const TeamList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get teams data
  const { data: teams = [], isLoading, isError } = useTeams();

  // Delete mutations
  const { mutate: deleteTeam, isLoading: isDeleteLoading } = useDeleteTeam();
  const { mutate: deleteTeams, isLoading: isBatchDeleteLoading } =
    useDeleteTeams();

  // Handle checkbox change
  const handleSelectTeam = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  // Handle select all teams
  const handleSelectAll = () => {
    if (selectedTeams.length === teams.length) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(teams.map((team) => team._id));
    }
  };

  // Handle single team deletion
  const handleDeleteTeam = (teamId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este equipo?")) {
      setIsDeleting(true);
      deleteTeam(teamId, {
        onSuccess: () => setIsDeleting(false),
        onError: (error) => {
          console.error("Error deleting team:", error);
          setIsDeleting(false);
          alert("Error al eliminar el equipo");
        },
      });
    }
  };

  // Handle batch team deletion
  const handleBatchDelete = () => {
    if (selectedTeams.length === 0) return;

    if (
      confirm(
        `¿Estás seguro de que deseas eliminar ${selectedTeams.length} equipo(s)?`
      )
    ) {
      setIsDeleting(true);
      deleteTeams(selectedTeams, {
        onSuccess: () => {
          setSelectedTeams([]);
          setIsDeleting(false);
        },
        onError: (error) => {
          console.error("Error deleting teams:", error);
          setIsDeleting(false);
          alert("Error al eliminar equipos");
        },
      });
    }
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
            <h1 className="text-2xl font-bold text-gray-800">Equipos</h1>
            <p className="text-gray-600">Gestiona los equipos disponibles</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            {selectedTeams.length > 0 && (
              <button
                onClick={handleBatchDelete}
                disabled={isDeleting || isBatchDeleteLoading}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition disabled:bg-red-300"
              >
                <Trash2Icon size={16} />
                <span>Eliminar {selectedTeams.length} seleccionado(s)</span>
              </button>
            )}
          </div>

          <button
            onClick={() => navigate("/teams/new")}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            <PlusIcon size={18} />
            <span>Crear Equipo</span>
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando equipos...</p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 mb-4">
              Error al cargar los equipos. Inténtelo de nuevo más tarde.
            </p>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No hay equipos disponibles.</p>
            <button
              onClick={() => navigate("/teams/new")}
              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              <PlusIcon size={18} />
              <span>Crear Primer Equipo</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTeams.length === teams.length}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entrenador
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teams.map((team: Team) => (
                  <tr key={team._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team._id)}
                        onChange={() => handleSelectTeam(team._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {team.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.coach || "Sin entrenador"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <button
                        onClick={() => navigate(`/teams/${team._id}/edit`)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mr-3"
                        title="Editar equipo"
                      >
                        <PencilIcon size={16} />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTeam(team._id)}
                        disabled={isDeleting || isDeleteLoading}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 disabled:text-red-300"
                        title="Eliminar equipo"
                      >
                        <Trash2Icon size={16} />
                        <span>Eliminar</span>
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

export default TeamList;
