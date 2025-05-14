import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { ArrowLeftIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMatch } from "../api/matchHooks";
// You need to implement useCreateMatch in your api/userHooks.ts

const matchSchema = z.object({
  teamA: z.string().min(1, "El equipo A es requerido"),
  teamB: z.string().min(1, "El equipo B es requerido"),
  date: z.string().min(1, "La fecha es requerida"),
  location: z.string().optional(),
  result: z.string().optional(),
});

type MatchFormData = z.infer<typeof matchSchema>;

const MatchForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    mutate: createMatch,
    isLoading,
    isError,
    error,
    data,
  } = useCreateMatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
    defaultValues: { result: "Draw" },
  });

  const onSubmit = (data: MatchFormData) => {
    createMatch(data, {
      onSuccess: () => navigate("/matches"),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <button
          onClick={() => navigate("/matches")}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeftIcon size={16} />
          <span>Volver a Partidos</span>
        </button>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">Crear Nuevo Partido</h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="mb-4">
              <label
                htmlFor="teamA"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Equipo A
              </label>
              <input
                id="teamA"
                type="text"
                {...register("teamA")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el nombre del equipo A"
              />
              {errors.teamA && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.teamA.message}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="teamB"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Equipo B
              </label>
              <input
                id="teamB"
                type="text"
                {...register("teamB")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el nombre del equipo B"
              />
              {errors.teamB && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.teamB.message}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha
              </label>
              <input
                id="date"
                type="text"
                {...register("date")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese la fecha del partido"
              />
              {errors.date && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.date.message}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ubicación
              </label>
              <input
                id="location"
                type="text"
                {...register("location")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese la ubicación del partido"
              />
              {errors.location && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.location.message}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="result"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Resultado
              </label>
              <input
                id="result"
                type="text"
                {...register("result")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el resultado del partido"
              />
              {errors.result && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.result.message}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate("/matches")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default MatchForm;
