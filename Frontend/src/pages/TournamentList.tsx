import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import {
  PlusIcon,
  ArrowLeftIcon,
  EyeIcon,
  UsersIcon,
  CalendarIcon,
  TrophyIcon,
} from "lucide-react";
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

  // Función para obtener el color del badge según el tipo de fase
  const getPhaseBadgeColor = (phaseType: string) => {
    switch (phaseType) {
      case "LEAGUE":
        return "bg-green-100 text-green-800";
      case "KNOCKOUT":
        return "bg-red-100 text-red-800";
      case "GROUP":
        return "bg-blue-100 text-blue-800";
      case "FINAL":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Función para obtener el texto descriptivo del tipo de fase
  const getPhaseTypeText = (phaseType: string) => {
    switch (phaseType) {
      case "LEAGUE":
        return "Liga";
      case "KNOCKOUT":
        return "Eliminación";
      case "GROUP":
        return "Grupos";
      case "FINAL":
        return "Final";
      case "QUALIFYING":
        return "Clasificación";
      default:
        return phaseType;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver al Panel</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏆 Torneos</h1>
            <p className="text-gray-600">
              Gestiona y visualiza todos los torneos disponibles
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Torneos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {tournaments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Torneos Activos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    tournaments.filter((t) => t.phases && t.phases.length > 0)
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Con Fases</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    tournaments.filter(
                      (t) =>
                        t.phases && t.phases.some((p) => p.type === "LEAGUE")
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <PlusIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nuevos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    tournaments.filter(
                      (t) => !t.phases || t.phases.length === 0
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Lista de Torneos
            </h2>
            <p className="text-sm text-gray-500">
              {tournaments.length} torneo{tournaments.length !== 1 ? "s" : ""}{" "}
              disponible{tournaments.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3">
            {selected.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                <span>Borrar {selected.length}</span>
              </button>
            )}
            <button
              onClick={() => navigate("/tournaments/new")}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
            >
              <PlusIcon size={18} />
              <span>Crear Torneo</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">Cargando torneos...</p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Error al cargar
            </h3>
            <p className="text-gray-600 mb-6">
              No se pudieron cargar los torneos. Inténtelo de nuevo más tarde.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Reintentar
            </button>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No hay torneos
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza creando tu primer torneo para organizar competencias.
            </p>
            <button
              onClick={() => navigate("/tournaments/new")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-xl"
            >
              <PlusIcon size={18} />
              <span>Crear Primer Torneo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <div
                key={tournament._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {tournament.name}
                      </h3>
                      <div className="flex items-center gap-2 text-blue-100">
                        <TrophyIcon size={16} />
                        <span className="text-sm">Torneo</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected.includes(tournament._id)}
                      onChange={() => handleSelect(tournament._id)}
                      className="w-5 h-5 rounded border-2 border-white/30 checked:bg-white checked:border-white"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Fases */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Fases Configuradas
                    </h4>
                    {tournament.phases && tournament.phases.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {tournament.phases.map((phase, index) => (
                          <span
                            key={phase._id || index}
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getPhaseBadgeColor(
                              phase.type
                            )}`}
                          >
                            {getPhaseTypeText(phase.type)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Sin fases configuradas
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800">
                        {tournament.phases?.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Fases</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800">
                        {tournament.phases?.some((p) => p.type === "LEAGUE")
                          ? "✓"
                          : "○"}
                      </p>
                      <p className="text-xs text-gray-600">Liga</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/tournaments/${tournament._id}/registrations`)
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                    >
                      <UsersIcon size={14} />
                      <span>Equipos</span>
                    </button>
                    <button
                      onClick={() => navigate(`/tournaments/${tournament._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                    >
                      <EyeIcon size={14} />
                      <span>Ver</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TournamentList;
