import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, CalendarIcon, EyeIcon } from "lucide-react";
import Header from "../components/layout/Header";
import { useTournament } from "../api/tournamentHooks";
import { useDeletePhase } from "../api/phaseHooks";

const TournamentDetail: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId } = useParams<{ tournamentId: string }>();

  // Data fetching - ahora solo necesitamos el torneo con fases populadas
  const {
    data: tournament,
    isLoading: isTournamentLoading,
    isError: isTournamentError,
  } = useTournament(tournamentId || "");

  const { mutate: deletePhase, isPending: isDeletingPhase } = useDeletePhase();

  // Obtener las fases del torneo populado
  const phases = tournament?.phases || [];

  // Log para debug
  console.log("TournamentDetail: tournament:", tournament);
  console.log("TournamentDetail: phases from tournament:", phases);

  const isLoading = isTournamentLoading;
  const isError = isTournamentError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Cargando datos del torneo...
            </span>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !tournament) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            No se pudo cargar la información del torneo.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/tournaments")}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver a Torneos</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {tournament.name}
            </h1>
            <p className="text-gray-600">Detalles del torneo y fases</p>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Fases del Torneo
            </h2>
            <p className="text-sm text-gray-500">
              {phases.length} fase{phases.length !== 1 ? "s" : ""} configurada
              {phases.length !== 1 ? "s" : ""}
              {phases.length > 0 && phases.some((p) => p.type === "LEAGUE") && (
                <span className="ml-2 text-green-600">
                  ✓ Incluye fase automática de Liga
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                navigate(`/tournaments/${tournamentId}/registrations`)
              }
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              <EyeIcon size={16} />
              <span>Ver Equipos</span>
            </button>
            <button
              onClick={() =>
                navigate(`/tournaments/${tournamentId}/phases/new`)
              }
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <PlusIcon size={16} />
              <span>Nueva Fase</span>
            </button>
          </div>
        </div>

        {/* Phases display */}
        {phases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">
              Este torneo no tiene fases configuradas.
              {tournament.phases && tournament.phases.length === 0 && (
                <span className="block text-sm text-gray-500 mt-2">
                  (El torneo debería tener una fase automática de tipo LEAGUE)
                </span>
              )}
            </p>
            <button
              onClick={() =>
                navigate(`/tournaments/${tournamentId}/phases/new`)
              }
              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              <PlusIcon size={18} />
              <span>Crear Primera Fase</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phases.map((phase) => (
              <div
                key={phase._id}
                className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition"
                onClick={() =>
                  navigate(`/tournaments/${tournamentId}/phases/${phase._id}`)
                }
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">
                      {phase.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        phase.type === "LEAGUE"
                          ? "bg-green-100 text-green-800"
                          : phase.type === "KNOCKOUT"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {phase.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {phase.type === "LEAGUE" && "Liga"}
                    {phase.type === "KNOCKOUT" && "Fase de eliminación directa"}
                    {phase.type === "GROUP" && "Fase de grupos"}
                    {phase.type === "FINAL" && "Fase final"}
                    {phase.type === "QUALIFYING" && "Fase de clasificación"}
                  </p>
                </div>
                <div className="bg-gray-50 px-5 py-3 border-t flex justify-end gap-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(
                        `/tournaments/${tournamentId}/phases/${phase._id}/fixture`
                      );
                    }}
                  >
                    Generar Calendario
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    disabled={isDeletingPhase}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm("¿Seguro que deseas borrar esta fase?")
                      ) {
                        deletePhase(phase._id);
                      }
                    }}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TournamentDetail;
