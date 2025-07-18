import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { ArrowLeftIcon, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTeam, useCheckTeamName } from "../api/teamHooks";
import { usePlayers } from "../api/playerHooks";

const teamSchema = z.object({
  name: z.string().min(1, "El nombre del equipo es requerido"),
  captainFullName: z.string().min(1, "El nombre del capitán es requerido"),
  captainPhoneNumber: z.string().min(1, "El teléfono del capitán es requerido"),
  captainEmail: z
    .string()
    .email("Debe ser un correo electrónico válido")
    .min(1, "El correo del capitán es requerido"),
  agreement: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar las reglas y términos del torneo",
  }),
  coach: z.string().optional(),
  profileImage: z.instanceof(File).optional().or(z.string().optional()),
  createdById: z.string().min(1, "El ID del creador es requerido"),
  players: z.array(z.string()).optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

const TeamForm: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    mutate: createTeam,
    isPending,
    isError,
    error: apiError,
    data,
  } = useCreateTeam();

  // Fetch players for the dropdown
  const { data: players = [], isLoading: isLoadingPlayers } = usePlayers();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: { players: [], agreement: false },
  });

  // Watch the team name for validation
  const teamName = watch("name");

  // Check if team name already exists
  const { data: nameCheckData, isLoading: isCheckingName } =
    useCheckTeamName(teamName);
  const nameExists = nameCheckData?.exists;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Update form value
    setValue("profileImage", file);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: TeamFormData) => {
    setError("");

    // Prevent submission if team name already exists
    if (nameExists) {
      setError(
        "El nombre del equipo ya está en uso. Por favor, elija otro nombre."
      );
      return;
    }

    // The createTeam hook will now handle the file upload internally
    createTeam(data, {
      onSuccess: () => navigate("/teams"),
      onError: (error: any) => {
        setError(error.response?.data?.message || "Error al crear el equipo");
      },
    });
  };

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
            <h1 className="text-xl font-bold">Crear Nuevo Equipo</h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}
            {isError && apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {apiError.message}
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del Equipo
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className={`w-full px-3 py-2 border ${
                    nameExists ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Ingrese el nombre del equipo"
                />
                {isCheckingName && (
                  <div className="absolute right-3 top-2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
              </div>
              {nameExists && (
                <div className="text-red-600 text-sm mt-1">
                  Este nombre de equipo ya está en uso
                </div>
              )}
              {errors.name && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.name.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="captainFullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre Completo del Capitán
              </label>
              <input
                id="captainFullName"
                type="text"
                {...register("captainFullName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el nombre completo del capitán"
              />
              {errors.captainFullName && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.captainFullName.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="captainPhoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Teléfono del Capitán
              </label>
              <input
                id="captainPhoneNumber"
                type="text"
                {...register("captainPhoneNumber")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el teléfono del capitán"
              />
              {errors.captainPhoneNumber && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.captainPhoneNumber.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="captainEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Electrónico del Capitán
              </label>
              <input
                id="captainEmail"
                type="email"
                {...register("captainEmail")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el correo electrónico del capitán"
              />
              {errors.captainEmail && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.captainEmail.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="coach"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Entrenador
              </label>
              <input
                id="coach"
                type="text"
                {...register("coach")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre del entrenador"
              />
              {errors.coach && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.coach.message}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="profileImage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Imagen de Perfil
              </label>
              <div className="mt-1 flex items-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setValue("profileImage", undefined);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center items-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">
                            Haga clic para subir
                          </span>{" "}
                          o arrastre y suelte
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG o GIF (MAX. 2MB)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        id="profileImage"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                )}
              </div>
              {errors.profileImage && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.profileImage.message}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="createdById"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Creador
              </label>
              <select
                id="createdById"
                {...register("createdById")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoadingPlayers}
              >
                <option value="">Seleccione un creador</option>
                {players.map((player) => (
                  <option key={player._id} value={player._id}>
                    {player.name}
                  </option>
                ))}
              </select>
              {isLoadingPlayers && (
                <div className="text-sm text-gray-500 mt-1">
                  Cargando jugadores...
                </div>
              )}
              {errors.createdById && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.createdById.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreement"
                    type="checkbox"
                    {...register("agreement")}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="agreement"
                    className="font-medium text-gray-700"
                  >
                    Acepto las reglas y términos del torneo.
                  </label>
                  {errors.agreement && (
                    <div className="text-red-600 text-sm mt-1">
                      {errors.agreement.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate("/teams")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TeamForm;
