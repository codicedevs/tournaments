import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, CalendarIcon, EyeIcon } from "lucide-react";
import Header from "../components/layout/Header";
import { usePhase } from "../api/phaseHooks";
import { usePhaseMatchdays } from "../api/fixtureHooks";
import { useTournament } from "../api/tournamentHooks";

const PhaseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId, phaseId } = useParams<{
    tournamentId: string;
    phaseId: string;
  }>();

  // Fetch data
  const {
    data: phase,
    isLoading: isPhaseLoading,
    isError: isPhaseError,
  } = usePhase(phaseId);
  const { data: tournament } = useTournament(tournamentId!);
  const { data: matchdays = [], isLoading: isMatchdaysLoading } =
    usePhaseMatchdays(phaseId);

  const isLoading = isPhaseLoading || isMatchdaysLoading;

  // Handle navigation to fixture generation
  const handleGenerateFixture = () => {
    navigate(`/tournaments/${tournamentId}/phases/${phaseId}/fixture`);
  };

  const handleViewFixture = () => {
    navigate(`/tournaments/${tournamentId}/phases/${phaseId}/matchdays`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Cargando datos de la fase...
            </span>
          </div>
        </main>
      </div>
    );
  }

  if (isPhaseError || !phase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            No se pudo cargar la información de la fase.
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
            onClick={() => navigate(`/tournaments/${tournamentId}`)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver al Torneo</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{phase?.name}</h1>
            <p className="text-gray-600">
              Tipo: {phase?.type} | Torneo: {tournament?.name || "Cargando..."}
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleGenerateFixture}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <CalendarIcon size={16} />
            <span>
              {matchdays.length > 0
                ? "Regenerar Calendario"
                : "Generar Calendario"}
            </span>
          </button>
        </div>

        {/* Phase summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Detalles de la Fase</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">
                Nombre:{" "}
                <span className="font-semibold text-gray-800">
                  {phase?.name}
                </span>
              </p>
              <p className="text-gray-600">
                Tipo:{" "}
                <span className="font-semibold text-gray-800">
                  {phase?.type}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                Jornadas:{" "}
                <span className="font-semibold text-gray-800">
                  {matchdays.length}
                </span>
              </p>
              <p className="text-gray-600">
                Estado:{" "}
                <span className="font-semibold text-gray-800">
                  {matchdays.length > 0
                    ? "Calendario generado"
                    : "Sin calendario"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Matchday summary */}
        {matchdays.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">
                Resumen del Calendario
              </h2>
              <button
                onClick={handleViewFixture}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver Todo
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {matchdays.slice(0, 6).map((matchday) => (
                  <div
                    key={matchday._id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      navigate(
                        `/tournaments/${tournamentId}/phases/${phaseId}/matchdays`
                      )
                    }
                  >
                    <h3 className="font-medium">Jornada {matchday.order}</h3>
                    {matchday.date ? (
                      <p className="text-sm text-gray-500">
                        {new Date(matchday.date).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">Fecha no definida</p>
                    )}
                  </div>
                ))}
              </div>
              {matchdays.length > 6 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleViewFixture}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver {matchdays.length - 6} jornadas más...
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PhaseDetail;
