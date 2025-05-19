import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "../components/layout/Header";
import { ArrowLeftIcon } from "lucide-react";
import { useTeam, useUpdateTeam } from "../api/teamHooks";

const teamSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  coach: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

const EditTeamForm: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Get team data
  const { data: team, isLoading: isTeamLoading } = useTeam(teamId || "");

  // Update mutation
  const { mutate: updateTeam, isLoading: isUpdating } = useUpdateTeam();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
  });

  // Reset form when team data is loaded
  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        coach: team.coach || "",
      });
    }
  }, [team, reset]);

  const onSubmit = (data: TeamFormData) => {
    if (!teamId) {
      setError("ID de equipo no encontrado");
      return;
    }

    updateTeam(
      {
        id: teamId,
        data: {
          name: data.name,
          coach: data.coach || undefined,
        },
      },
      {
        onSuccess: () => {
          navigate("/teams");
        },
        onError: (error) => {
          console.error("Error updating team:", error);
          setError("Error al actualizar el equipo. Inténtelo de nuevo.");
        },
      }
    );
  };

  const isLoading = isTeamLoading || isUpdating;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <button
          onClick={() => navigate("/teams")}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon size={16} />
          <span>Volver a Equipos</span>
        </button>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">Editar Equipo</h1>
          </div>

          {isTeamLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando datos del equipo...</p>
            </div>
          ) : (
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
                  Nombre del Equipo
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese el nombre del equipo"
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
                  htmlFor="coach"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Entrenador (opcional)
                </label>
                <input
                  id="coach"
                  type="text"
                  {...register("coach")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese el nombre del entrenador"
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => navigate("/teams")}
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
                  {isUpdating ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditTeamForm;
