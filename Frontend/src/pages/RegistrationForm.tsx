import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "lucide-react";
import Header from "../components/layout/Header";
import { useCreateRegistration } from "../api/registrationHooks";
import { useTournaments, useTournament } from "../api/tournamentHooks";
import { useTeams } from "../api/teamHooks";
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
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      tournamentId: preselectedTournamentId || "",
    },
  });

  // Set preselected tournament if available
  React.useEffect(() => {
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
  const { mutate: registerTeam, isLoading: isRegistering } =
    useCreateRegistration();
  const { data: selectedTournament } = useTournament(selectedTournamentId);

  const isLoading = isLoadingTournaments || isLoadingTeams || isRegistering;

  // Form submission handler
  const onSubmit = (data: RegistrationFormData) => {
    setError("");
    registerTeam(data, {
      onSuccess: () => {
        navigate(
          preselectedTournamentId
            ? `/tournaments/${preselectedTournamentId}/registrations`
            : "/tournaments"
        );
      },
      onError: (error: any) => {
        if (error.response?.status === 409) {
          setError("Este equipo ya está registrado en el torneo.");
        } else {
          setError("Error al registrar equipo. Por favor, inténtelo de nuevo.");
        }
      },
    });
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
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
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
              {errors.teamId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.teamId.message}
                </p>
              )}
            </div>

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
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                disabled={isLoading}
              >
                {isRegistering ? "Registrando..." : "Registrar Equipo"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegistrationForm;
