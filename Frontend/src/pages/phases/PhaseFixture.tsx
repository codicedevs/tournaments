import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, CalendarIcon, EyeIcon } from "lucide-react";
import Header from "../components/layout/Header";
import { useTournament } from "../api/tournamentHooks";
import { usePhasesByTournament } from "../api/phaseHooks";

const PhaseFixture: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId, phaseId } = useParams<{
    tournamentId: string;
    phaseId: string;
  }>();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<{
    type: "auto" | "manual";
    data: any;
  } | null>(null);

  // Data fetching
  const {
    data: tournament,
    isLoading: isTournamentLoading,
    isError: isTournamentError,
  } = useTournament(tournamentId || "");

  const {
    data: phases = [],
    isLoading: isPhasesLoading,
    isError: isPhasesError,
  } = usePhasesByTournament(tournamentId);

  const isLoading = isTournamentLoading || isPhasesLoading;
  const isError = isTournamentError || isPhasesError;

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

  // Handle submission with registered teams
  const onSubmitWithRegisteredTeams = (data: FixtureFormData) => {
    setError(null);

    if (!phaseId) {
      setError("ID de fase no encontrado");
      return;
    }

    // If there are existing matchdays, show confirmation dialog
    if (existingMatchDays.length > 0) {
      setPendingSubmission({
        type: "auto",
        data,
      });
      setShowConfirmation(true);
      return;
    }

    // Otherwise proceed directly
    executeGenerateFixtures(data);
  };

  // Handle submission with empty fixture
  const onSubmitEmptyFixture = (data: EmptyFixtureFormData) => {
    setError(null);

    if (!phaseId) {
      setError("ID de fase no encontrado");
      return;
    }

    // If there are existing matchdays, show confirmation dialog
    if (existingMatchDays.length > 0) {
      setPendingSubmission({
        type: "manual",
        data,
      });
      setShowConfirmation(true);
      return;
    }

    // Otherwise proceed directly
    executeCreateLeague(data);
  };

  // Execute fixture generation after confirming or directly
  const executeGenerateFixtures = (data: FixtureFormData) => {
    generateFixtures(
      { phaseId, isLocalAway: data.isLocalAway },
      {
        onSuccess: () => {
          setShowConfirmation(false);
          navigate(`/tournaments/${tournamentId}/phases/${phaseId}`);
        },
        onError: (err: any) => {
          console.error("Error generating fixtures:", err);
          setError(
            err.response?.data?.message || "Error al generar el calendario"
          );
        },
      }
    );
  };

  // Execute league creation after confirming or directly
  const executeCreateLeague = (data: EmptyFixtureFormData) => {
    if (createEmptyMatchDays && data.matchDaysAmount) {
      // Create empty matchdays
      createLeague(
        {
          phaseId,
          matchDaysAmount: data.matchDaysAmount,
          isLocalAway: data.isLocalAway,
        },
        {
          onSuccess: () => {
            setShowConfirmation(false);
            navigate(`/tournaments/${tournamentId}/phases/${phaseId}`);
          },
          onError: (err: any) => {
            console.error("Error creating match days:", err);
            setError(
              err.response?.data?.message || "Error al crear las jornadas"
            );
          },
        }
      );
    } else {
      // Calculate matchdays based on team count and create empty fixture
      const teamCount = data.teamCount;
      // For round-robin: n-1 matchdays where n is number of teams
      const calculatedMatchDays = teamCount - 1;

      createLeague(
        {
          phaseId,
          matchDaysAmount: calculatedMatchDays,
          isLocalAway: data.isLocalAway,
        },
        {
          onSuccess: () => {
            setShowConfirmation(false);
            navigate(`/tournaments/${tournamentId}/phases/${phaseId}`);
          },
          onError: (err: any) => {
            console.error("Error creating match days:", err);
            setError(
              err.response?.data?.message || "Error al crear las jornadas"
            );
          },
        }
      );
    }
  };

  // Handle confirmation dialog response
  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed && pendingSubmission) {
      if (pendingSubmission.type === "auto") {
        executeGenerateFixtures(pendingSubmission.data);
      } else {
        executeCreateLeague(pendingSubmission.data);
      }
    } else {
      // Reset if canceled
      setShowConfirmation(false);
      setPendingSubmission(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        {/* ...existing navigation buttons... */}

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">Generar Calendario</h1>
            <p className="text-sm opacity-90">
              {phase?.name} | {tournament?.name}
            </p>
          </div>

          <div className="p-6">
            {existingMatchDays.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-4">
                <strong className="text-yellow-800">¡Atención!</strong> Ya
                existen {existingMatchDays.length} jornadas para esta fase. Si
                continúas, se{" "}
                <span className="font-semibold underline">
                  eliminarán todas las jornadas y partidos existentes
                </span>{" "}
                y se generará una nueva estructura.
              </div>
            )}

            {/* ...existing error state... */}
            {/* ...existing mode selection... */}
            {/* ...existing form components... */}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-red-600 mb-4">
                Confirmar eliminación
              </h2>
              <p className="mb-4">
                Esta acción eliminará permanentemente{" "}
                <span className="font-semibold">
                  {existingMatchDays.length} jornadas
                </span>{" "}
                y todos sus partidos asociados.
              </p>
              <p className="mb-6">¿Estás seguro de que quieres continuar?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleConfirmation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleConfirmation(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Sí, eliminar y regenerar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PhaseFixture;
