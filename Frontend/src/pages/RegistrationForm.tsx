import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "lucide-react";
import Header from "../components/layout/Header";
import { useCreateRegistration } from "../api/registrationHooks";
import { useTournaments, useTournament } from "../api/tournamentHooks";
import { useTeams } from "../api/teamHooks";
import { useRegistrationsByTournament } from "../api/registrationHooks";
import { Team } from "../models";

const registrationSchema = z.object({
  teamId: z.string().min(1, "El equipo es requerido"),
  tournamentId: z.string().min(1, "El torneo es requerido"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId: preselectedTournamentId } = useParams<{
    tournamentId?: string;
  }>();
  const [error, setError] = useState("");

  // Form setup
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    getValues,
    resetField,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      tournamentId: preselectedTournamentId || "",
    },
  });

  // Set preselected tournament if available
  useEffect(() => {
    if (preselectedTournamentId) {
      setValue("tournamentId", preselectedTournamentId);
    }
  }, [preselectedTournamentId, setValue]);

  // Watch for values
  const selectedTournamentId = watch("tournamentId");

  // Data fetching
  const { data: tournaments = [], isLoading: isLoadingTournaments } =
    useTournaments();
  const { data: teams = [], isLoading: isLoadingTeams } = useTeams();
  const {
    mutate: registerTeam,
    isPending: isRegistering,
    isError: isErrorRegistro,
    error: errorRegistro,
  } = useCreateRegistration();
  const [registroTerminado, setRegistroTerminado] = useState(false);
  const { data: selectedTournament } = useTournament(selectedTournamentId);
  // Equipos ya registrados en el torneo
  const { data: registrationsByTournament = [] } =
    useRegistrationsByTournament(selectedTournamentId);

  const isLoading = isLoadingTournaments || isLoadingTeams || isRegistering;

  // Estado para equipos a registrar
  const [pendingTeams, setPendingTeams] = useState<Team[]>([]);

  const handleAddTeam = () => {
    setError("");
    const values = getValues();
    if (!values.teamId) {
      setError("Seleccione un equipo");
      return;
    }
    const team = teams.find((t) => t._id === values.teamId);
    if (!team) return;
    if (pendingTeams.some((t) => t._id === team._id)) {
      setError("Este equipo ya está en la lista para registrar.");
      return;
    }
    // Verificar si ya está registrado en el torneo
    const yaRegistrado = registrationsByTournament.some((reg) =>
      typeof reg.teamId === "string"
        ? reg.teamId === team._id
        : reg.teamId?._id === team._id
    );
    if (yaRegistrado) {
      setError("Este equipo ya está registrado en el torneo.");
      return;
    }
    setPendingTeams((prev) => [...prev, team]);
    resetField("teamId");
  };

  const handleConfirmAll = async (e: any) => {
    e.stopPropagation();
    setError("");
    setRegistroTerminado(false);
    if (pendingTeams.length === 0) return;

    type Result = { team: Team; success: boolean; error?: any };
    const promises = pendingTeams.map(
      (team) =>
        new Promise<Result>((resolve) => {
          registerTeam(
            { teamId: team._id, tournamentId: selectedTournamentId },
            {
              onSuccess: () => resolve({ team, success: true }),
              onError: (error) => resolve({ team, success: false, error }),
            }
          );
        })
    );

    await Promise.all(promises);
    setRegistroTerminado(true);
  };

  const handleRemovePending = (id: string) => {
    setPendingTeams((prev) => prev.filter((t) => t._id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <button
          onClick={() =>
            navigate(
              preselectedTournamentId
                ? `/tournaments/${preselectedTournamentId}/registrations`
                : "/tournaments"
            )
          }
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon size={16} />
          <span>Volver</span>
        </button>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">
              {selectedTournament
                ? `Registrar Equipo en: ${selectedTournament.name}`
                : "Registrar Equipo en Torneo"}
            </h1>
          </div>
          <form
            className="p-6"
            autoComplete="off"
            onSubmit={(e) => e.preventDefault()}
          >
            {isErrorRegistro && errorRegistro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {typeof errorRegistro === "string"
                  ? errorRegistro
                  : (errorRegistro as any).message ||
                    "Ocurrió un error inesperado."}
              </div>
            )}

            {!preselectedTournamentId && (
              <div className="mb-4">
                <label
                  htmlFor="tournamentId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Torneo
                </label>
                <select
                  id="tournamentId"
                  {...register("tournamentId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading || !!preselectedTournamentId}
                >
                  <option value="">Seleccione un torneo</option>
                  {tournaments.map((tournament) => (
                    <option key={tournament._id} value={tournament._id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
                {errors.tournamentId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tournamentId.message}
                  </p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="teamId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Equipo
              </label>
              <div className="flex gap-2">
                <select
                  id="teamId"
                  {...register("teamId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  <option value="">Seleccione un equipo</option>
                  {teams.map((team: Team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  disabled={isLoading}
                  onClick={handleAddTeam}
                >
                  Agregar
                </button>
              </div>
              {errors.teamId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.teamId.message}
                </p>
              )}
            </div>

            {/* Advertencia visual si el equipo seleccionado ya está registrado */}
            {(() => {
              const values = getValues();
              if (values.teamId) {
                const team = teams.find((t) => t._id === values.teamId);
                if (team) {
                  const yaRegistrado = registrationsByTournament.some((reg) =>
                    typeof reg.teamId === "string"
                      ? reg.teamId === team._id
                      : reg.teamId?._id === team._id
                  );
                  if (yaRegistrado) {
                    return (
                      <div className="mt-2 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2 text-sm">
                        ⚠️ Este equipo ya está registrado en el torneo.
                      </div>
                    );
                  }
                }
              }
              return null;
            })()}

            {pendingTeams.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipos a registrar:
                </label>
                <ul className="list-disc pl-5">
                  {pendingTeams.map((team) => (
                    <li key={team._id} className="flex items-center gap-2">
                      <span>{team.name}</span>
                      <button
                        type="button"
                        className="text-red-600 hover:underline text-xs"
                        onClick={() => handleRemovePending(team._id)}
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    preselectedTournamentId
                      ? `/tournaments/${preselectedTournamentId}/registrations`
                      : "/tournaments"
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                Cancelar
              </button>
              {!isErrorRegistro && registroTerminado ? (
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() =>
                    navigate(
                      preselectedTournamentId
                        ? `/tournaments/${preselectedTournamentId}/registrations`
                        : "/tournaments"
                    )
                  }
                >
                  Volver a la lista
                </button>
              ) : (
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  disabled={isLoading || pendingTeams.length === 0}
                  onClick={handleConfirmAll}
                >
                  Confirmar registro de {pendingTeams.length} equipo(s)
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegistrationForm;
