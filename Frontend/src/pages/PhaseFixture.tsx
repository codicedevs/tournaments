import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, CalendarIcon, AlertTriangleIcon } from "lucide-react";
import Header from "../components/layout/Header";
import { usePhase } from "../api/phaseHooks";
import {
  usePhaseMatchdays,
  useGenerateFixtures,
  useCreateLeague,
} from "../api/fixtureHooks";
import { useTournament } from "../api/tournamentHooks";
import { useRegistrationsByTournament } from "../api/registrationHooks";

// Form schema for fixture generation with registered teams
const fixtureFormSchema = z.object({
  isLocalAway: z.boolean().default(true),
});

// Form schema for empty fixture generation
const emptyFixtureFormSchema = z.object({
  isLocalAway: z.boolean().default(true),
  teamCount: z
    .number()
    .int()
    .min(2, "Se necesitan al menos 2 equipos")
    .max(30, "Máximo 30 equipos permitidos"),
  matchDaysAmount: z.number().int().min(1, "Debe ser al menos 1").optional(),
});

type FixtureFormData = z.infer<typeof fixtureFormSchema>;
type EmptyFixtureFormData = z.infer<typeof emptyFixtureFormSchema>;

const PhaseFixture: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId, phaseId } = useParams<{
    tournamentId: string;
    phaseId: string;
  }>();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  // Form setup for regular fixture generation
  const {
    register: registerFixture,
    handleSubmit: handleSubmitFixture,
    formState: { errors: fixtureErrors },
  } = useForm<FixtureFormData>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: {
      isLocalAway: true,
    },
  });

  // Form setup for empty fixture generation
  const {
    register: registerEmpty,
    handleSubmit: handleSubmitEmpty,
    formState: { errors: emptyErrors },
    watch: watchEmpty,
  } = useForm<EmptyFixtureFormData>({
    resolver: zodResolver(emptyFixtureFormSchema),
    defaultValues: {
      isLocalAway: true,
      teamCount: 2,
      matchDaysAmount: undefined,
    },
  });

  const createEmptyMatchDays = watchEmpty("matchDaysAmount") !== undefined;

  // Fetch data
  const { data: phase, isLoading: isPhaseLoading } = usePhase(phaseId);
  const { data: tournament } = useTournament(tournamentId || "");
  const { data: registrations = [], isLoading: isRegistrationsLoading } =
    useRegistrationsByTournament(tournamentId);
  const { data: existingMatchDays = [], isLoading: isMatchdaysLoading } =
    usePhaseMatchdays(phaseId);

  // Mutations
  const { mutate: generateFixtures, isLoading: isGenerating } =
    useGenerateFixtures();
  const { mutate: createLeague, isLoading: isCreatingLeague } =
    useCreateLeague();

  const isLoading =
    isPhaseLoading ||
    isMatchdaysLoading ||
    isGenerating ||
    isCreatingLeague ||
    isRegistrationsLoading;

  // Check if we have enough registered teams
  const teamsCount = registrations.length;
  const hasRegisteredTeams = teamsCount >= 2;

  // Handle submission with registered teams
  const onSubmitWithRegisteredTeams = (data: FixtureFormData) => {
    setError(null);

    if (!phaseId) {
      setError("ID de fase no encontrado");
      return;
    }

    if (existingMatchDays.length > 0) {
      // Store the action for after confirmation
      setPendingAction({
        type: "auto",
        data: data,
      });
      setShowConfirmDialog(true);
      return;
    }

    // If no existing matchdays, proceed directly
    executeGenerateFixture(data);
  };

  // Handle submission with empty fixture
  const onSubmitEmptyFixture = (data: EmptyFixtureFormData) => {
    setError(null);

    if (!phaseId) {
      setError("ID de fase no encontrado");
      return;
    }

    if (existingMatchDays.length > 0) {
      // Store the action for after confirmation
      setPendingAction({
        type: "manual",
        data: data,
      });
      setShowConfirmDialog(true);
      return;
    }

    // If no existing matchdays, proceed directly
    executeEmptyFixture(data);
  };

  // Execute fixture generation after confirmation
  const executeGenerateFixture = (data: FixtureFormData) => {
    generateFixtures(
      { phaseId, isLocalAway: data.isLocalAway },
      {
        onSuccess: () => {
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

  // Execute empty fixture creation after confirmation
  const executeEmptyFixture = (data: EmptyFixtureFormData) => {
    if (createEmptyMatchDays && data.matchDaysAmount) {
      // Create empty matchdays with specified amount
      createLeague(
        {
          phaseId,
          matchDaysAmount: data.matchDaysAmount,
          isLocalAway: data.isLocalAway,
        },
        {
          onSuccess: () => {
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
      // Calculate matchdays based on team count
      const teamCount = data.teamCount;
      const calculatedMatchDays = teamCount - 1;

      createLeague(
        {
          phaseId,
          matchDaysAmount: calculatedMatchDays,
          isLocalAway: data.isLocalAway,
        },
        {
          onSuccess: () => {
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

  // Handle confirmation dialog result
  const handleConfirmAction = (confirmed: boolean) => {
    if (confirmed && pendingAction) {
      if (pendingAction.type === "auto") {
        executeGenerateFixture(pendingAction.data);
      } else {
        executeEmptyFixture(pendingAction.data);
      }
    }

    // Reset dialog state regardless of confirmation
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <button
          onClick={() =>
            navigate(`/tournaments/${tournamentId}/phases/${phaseId}`)
          }
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon size={16} />
          <span>Volver a la Fase</span>
        </button>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">Generar Calendario</h1>
            <p className="text-sm opacity-90">
              {phase?.name} | {tournament?.name}
            </p>
          </div>

          <div className="p-6">
            {existingMatchDays.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                <strong>¡Atención!</strong> Ya existen{" "}
                {existingMatchDays.length} jornadas para esta fase. Generar un
                nuevo calendario
                <span className="font-bold"> eliminará permanentemente </span>
                todas las jornadas y partidos existentes.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {/* Mode selection */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setMode("auto")}
                  className={`px-4 py-2 rounded-md ${
                    mode === "auto"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  Automático (con equipos registrados)
                </button>
                <button
                  type="button"
                  onClick={() => setMode("manual")}
                  className={`px-4 py-2 rounded-md ${
                    mode === "manual"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  Manual (definir número de equipos)
                </button>
              </div>
            </div>

            {/* Auto mode (with registered teams) */}
            {mode === "auto" && (
              <div>
                {!hasRegisteredTeams && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 flex items-start gap-3">
                    <AlertTriangleIcon className="mt-0.5" size={18} />
                    <div>
                      <p className="font-medium">
                        No hay suficientes equipos registrados
                      </p>
                      <p className="text-sm">
                        Se necesitan al menos 2 equipos registrados para generar
                        automáticamente el calendario. Actualmente hay{" "}
                        {teamsCount} equipo(s).
                      </p>
                      <p className="text-sm mt-2">Opciones:</p>
                      <ul className="text-sm list-disc list-inside ml-2">
                        <li>
                          <a
                            href={`/tournaments/${tournamentId}/registrations`}
                            className="underline"
                          >
                            Registra más equipos
                          </a>{" "}
                          antes de continuar
                        </li>
                        <li>
                          O usa el modo manual para crear un calendario vacío
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleSubmitFixture(onSubmitWithRegisteredTeams)}
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isLocalAway"
                        {...registerFixture("isLocalAway")}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="isLocalAway"
                        className="text-sm font-medium text-gray-700"
                      >
                        Crear partidos de ida y vuelta
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Cada equipo jugará como local y como visitante contra cada
                      rival.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/tournaments/${tournamentId}/phases/${phaseId}`
                        )
                      }
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                      disabled={isLoading || !hasRegisteredTeams}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <CalendarIcon size={16} />
                          <span>Generar Calendario</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Manual mode (specify number of teams) */}
            {mode === "manual" && (
              <form onSubmit={handleSubmitEmpty(onSubmitEmptyFixture)}>
                <div className="mb-4">
                  <label
                    htmlFor="teamCount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Número de Equipos
                  </label>
                  <input
                    id="teamCount"
                    type="number"
                    {...registerEmpty("teamCount", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 10"
                    min={2}
                    disabled={isLoading}
                  />
                  {emptyErrors.teamCount && (
                    <p className="mt-1 text-sm text-red-600">
                      {emptyErrors.teamCount.message}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="createEmpty"
                      checked={createEmptyMatchDays}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Set a default value for matchDaysAmount
                          const teamCount = watchEmpty("teamCount") || 2;
                          const defaultMatchDays = teamCount - 1;
                          registerEmpty("matchDaysAmount", {
                            value: defaultMatchDays,
                          });
                        } else {
                          registerEmpty("matchDaysAmount", {
                            value: undefined,
                          });
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="createEmpty"
                      className="text-sm font-medium text-gray-700"
                    >
                      Especificar número de jornadas manualmente
                    </label>
                  </div>
                </div>

                {createEmptyMatchDays && (
                  <div className="mb-4 ml-6">
                    <label
                      htmlFor="matchDaysAmount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Número de Jornadas
                    </label>
                    <input
                      id="matchDaysAmount"
                      type="number"
                      {...registerEmpty("matchDaysAmount", {
                        valueAsNumber: true,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: 6"
                      min={1}
                      disabled={isLoading}
                    />
                    {emptyErrors.matchDaysAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {emptyErrors.matchDaysAmount.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isLocalAwayEmpty"
                      {...registerEmpty("isLocalAway")}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isLocalAwayEmpty"
                      className="text-sm font-medium text-gray-700"
                    >
                      Crear jornadas de ida y vuelta
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Duplica el número de jornadas para partidos de ida y vuelta.
                  </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/tournaments/${tournamentId}/phases/${phaseId}`)
                    }
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CalendarIcon size={16} />
                        <span>Crear Jornadas Vacías</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-red-600 mb-3">
                Confirmar eliminación
              </h2>
              <p className="mb-4">
                Estás a punto de eliminar {existingMatchDays.length} jornadas y
                todos sus partidos asociados. Esta acción no se puede deshacer.
              </p>
              <p className="mb-6">¿Estás seguro de que deseas continuar?</p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleConfirmAction(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleConfirmAction(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Sí, eliminar y continuar
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
