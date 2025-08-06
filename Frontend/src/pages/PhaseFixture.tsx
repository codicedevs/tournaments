import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, CalendarIcon, AlertTriangleIcon } from "lucide-react";
import Header from "../components/layout/Header";
import { usePhase } from "../api/phaseHooks";
import { usePhaseMatchdays, useGenerateFixtures } from "../api/fixtureHooks";
import { useDeleteMatchdaysByPhase } from "../api/fixtureHooks";
import { useTournament } from "../api/tournamentHooks";
import { useRegistrationsByTournament } from "../api/registrationHooks";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

const fixtureFormSchema = z.object({
  isLocalAway: z.boolean(),
  startDate: z.string().nonempty("La fecha es obligatoria"),
});

type FixtureFormData = z.infer<typeof fixtureFormSchema>;

const PhaseFixture: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId, phaseId } = useParams<{
    tournamentId: string;
    phaseId: string;
  }>();
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<FixtureFormData | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FixtureFormData>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: {
      isLocalAway: true,
      startDate: "",
    },
  });

  // Data fetching
  const { data: phase, isLoading: isPhaseLoading } = usePhase(phaseId);
  const { data: tournament } = useTournament(tournamentId || "");
  const { data: registrations = [], isLoading: isRegistrationsLoading } =
    useRegistrationsByTournament(tournamentId);
  const { data: existingMatchDays = [], isLoading: isMatchdaysLoading } =
    usePhaseMatchdays(phaseId);

  const { mutate: generateFixtures, isPending: isGenerating } =
    useGenerateFixtures();
  const { mutateAsync: deleteMatchdaysByPhase } = useDeleteMatchdaysByPhase();

  const isLoading =
    isPhaseLoading ||
    isMatchdaysLoading ||
    isGenerating ||
    isRegistrationsLoading;

  const teamsCount = registrations.length;
  const hasRegisteredTeams = teamsCount >= 2;

  const onSubmit = async (data: FixtureFormData) => {
    setError(null);
    if (!phaseId) {
      setError("ID de fase no encontrado");
      return;
    }
    if (existingMatchDays.length > 0) {
      setShowConfirm(true);
      setPendingData(data);
      return;
    }
    generateFixtures(
      {
        phaseId,
        isLocalAway: data.isLocalAway,
        startDate: data.startDate,
        weekDay: new Date(data.startDate).getDay().toString(),
      },
      {
        onSuccess: () => {
          navigate(`/divisions/${tournamentId}/phases/${phaseId}`);
        },
        onError: (err: any) => {
          setError(
            err.response?.data?.message || "Error al generar el calendario"
          );
        },
      }
    );
  };

  // Función para borrar todas las jornadas de la fase
  const handleDeleteAndGenerate = async () => {
    if (!phaseId || !pendingData) return;
    try {
      await deleteMatchdaysByPhase(phaseId);
      setShowConfirm(false);
      setPendingData(null);
      // Ahora sí, generar el fixture
      generateFixtures(
        {
          phaseId,
          isLocalAway: pendingData.isLocalAway,
          startDate: pendingData.startDate,
          weekDay: new Date(pendingData.startDate).getDay().toString(),
        },
        {
          onSuccess: () => {
            navigate(`/divisions/${tournamentId}/phases/${phaseId}`);
          },
          onError: (err: any) => {
            setError(
              err.response?.data?.message || "Error al generar el calendario"
            );
          },
        }
      );
    } catch (err: any) {
      setError("Error al eliminar las jornadas existentes");
      setShowConfirm(false);
      setPendingData(null);
    }
  };

  const handleBack = () => {
    navigate(`/divisions/${tournamentId}/phases/${phaseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <button
          onClick={handleBack}
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}
            {!hasRegisteredTeams ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-4 flex flex-col items-center">
                <AlertTriangleIcon className="mb-2" size={24} />
                <p className="font-medium mb-2">
                  No hay suficientes equipos registrados
                </p>
                <p className="text-sm mb-4">
                  Se necesitan al menos 2 equipos registrados para generar el
                  calendario.
                </p>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() =>
                    navigate(`/divisions/${tournamentId}/registrations`)
                  }
                >
                  Ir a registrar equipos
                </button>
              </div>
            ) : (
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de inicio
                  </label>
                  <Controller
                    control={control}
                    name="startDate"
                    render={({ field }) => (
                      <DatePicker
                        locale={es}
                        dateFormat="dd/MM/yyyy"
                        selected={field.value ? new Date(field.value) : null}
                        onChange={(date: Date | null) =>
                          field.onChange(
                            date ? date.toISOString().split("T")[0] : ""
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholderText="dd/mm/aaaa"
                      />
                    )}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleBack}
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
                        <span>Generar Calendario</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
            {/* Confirmación para borrar jornadas */}
            {showConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                  <h2 className="text-xl font-bold text-red-600 mb-3">
                    Confirmar eliminación
                  </h2>
                  <p className="mb-4">
                    Ya existen jornadas para esta fase. ¿Deseas borrarlas y
                    generar un nuevo fixture?
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowConfirm(false);
                        setPendingData(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDeleteAndGenerate}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Sí, borrar y generar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PhaseFixture;
