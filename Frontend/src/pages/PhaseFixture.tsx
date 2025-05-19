import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, CalendarIcon } from "lucide-react";
import Header from "../components/layout/Header";
import { usePhase } from "../api/phaseHooks";
import { usePhaseMatchdays, useGenerateFixtures } from "../api/fixtureHooks";
import { useTournament } from "../api/tournamentHooks";
import { useRegistrationsByTournament } from "../api/registrationHooks";

const fixtureFormSchema = z.object({
  isLocalAway: z.boolean().default(true),
});

type FixtureFormData = z.infer<typeof fixtureFormSchema>;

const PhaseFixture: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId, phaseId } = useParams<{
    tournamentId: string;
    phaseId: string;
  }>();
  const [error, setError] = useState<string | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FixtureFormData>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: {
      isLocalAway: true,
    },
  });

  // Fetch data
  const { data: phase, isLoading: isPhaseLoading } = usePhase(phaseId);
  const { data: tournament } = useTournament(tournamentId || "");
  const { data: registrations = [] } =
    useRegistrationsByTournament(tournamentId);
  const { data: existingMatchDays = [], isLoading: isMatchdaysLoading } =
    usePhaseMatchdays(phaseId);

  // Mutations
  const { mutate: generateFixtures, isLoading: isGenerating } =
    useGenerateFixtures();

  const isLoading = isPhaseLoading || isMatchdaysLoading || isGenerating;

  // Calculate if there are enough teams for fixture generation
  const teamsCount = registrations.length;
  const hasEnoughTeams = teamsCount >= 2;

  const onSubmit = (data: FixtureFormData) => {
    setError(null);

    if (!phaseId) {
      setError("ID de fase no encontrado");
      return;
    }

    if (!hasEnoughTeams) {
      setError(
        "No hay suficientes equipos registrados para generar el calendario"
      );
      return;
    }

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
            {existingMatchDays.length > 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-4">
                <strong>Atención:</strong> Ya existen {existingMatchDays.length}{" "}
                jornadas para esta fase. Generar un nuevo calendario reemplazará
                la estructura actual.
              </div>
            ) : null}

            {!hasEnoughTeams ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                Se necesitan al menos 2 equipos registrados para generar el
                calendario. Actualmente solo hay {teamsCount} equipo(s)
                registrado(s).
              </div>
            ) : null}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isLocalAway"
                    {...register("isLocalAway")}
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
                  disabled={isLoading || !hasEnoughTeams}
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
        </div>
      </main>
    </div>
  );
};

export default PhaseFixture;
