import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "lucide-react";
import Header from "../components/layout/Header";
import { useCreatePhase } from "../api/phaseHooks";
import { useTournament } from "../api/tournamentHooks";
import { PhaseType } from "../models/Phase";

const phaseSchema = z.object({
  name: z.string().min(1, "El nombre de la fase es requerido"),
  type: z.nativeEnum(PhaseType, {
    errorMap: () => ({ message: "Debe seleccionar un tipo de fase válido" }),
  }),
});

type PhaseFormData = z.infer<typeof phaseSchema>;

const PhaseForm: React.FC = () => {
  const navigate = useNavigate();
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [error, setError] = useState("");

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhaseFormData>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      type: PhaseType.LEAGUE,
    },
  });

  // Data fetching
  const { data: tournament, isLoading: isTournamentLoading } = useTournament(
    tournamentId || ""
  );
  const { mutate: createPhase, isLoading: isCreating } = useCreatePhase();

  const isLoading = isTournamentLoading || isCreating;

  // Form submission handler
  const onSubmit = (data: PhaseFormData) => {
    setError("");
    if (!tournamentId) {
      setError("ID del torneo no encontrado");
      return;
    }

    createPhase(
      {
        name: data.name,
        type: data.type,
        tournamentId,
      },
      {
        onSuccess: (newPhase) => {
          navigate(`/tournaments/${tournamentId}/phases/${newPhase._id}`);
        },
        onError: (err) => {
          console.error("Error creating phase:", err);
          setError("Error al crear la fase. Por favor, inténtelo de nuevo.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <button
          onClick={() => navigate(`/tournaments/${tournamentId}`)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon size={16} />
          <span>Volver al Torneo</span>
        </button>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">
              {tournament
                ? `Nueva Fase para: ${tournament.name}`
                : "Nueva Fase"}
            </h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de la Fase
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Fase de Grupos"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo de Fase
              </label>
              <select
                id="type"
                {...register("type")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                {Object.values(PhaseType).map((type) => {
                  const typeLabels: Record<string, string> = {
                    GROUP: "Grupos",
                    KNOCKOUT: "Eliminatoria",
                    LEAGUE: "Liga",
                    FINAL: "Final",
                    QUALIFYING: "Clasificatoria",
                  };
                  return (
                    <option key={type} value={type}>
                      {typeLabels[type] || type}
                    </option>
                  );
                })}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate(`/tournaments/${tournamentId}`)}
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
                {isCreating ? "Creando..." : "Crear Fase"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PhaseForm;
