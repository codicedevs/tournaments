import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "../components/layout/Header";
import { ArrowLeftIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateTeam,
  useUpdateTeam,
  useCheckTeamName,
  useTeam,
} from "../api/teamHooks";
import { useApp } from "../context/AppContext";
import { useTournaments } from "../api/tournamentHooks";
import { useCreateRegistration } from "../api/registrationHooks";
import defaultTeamImage from "../assets/LoyalLeague2.png?url";

const teamSchema = z.object({
  name: z.string().min(1, "El nombre del equipo es requerido"),
  referentName: z.string().min(1, "El nombre del delegado es requerido"),
  referentPhoneNumber: z.string().optional(),
  referentEmail: z
    .string()
    .email("Debe ser un correo electrónico válido")
    .or(z.literal(""))
    .optional(),
  coach: z.string().optional(),
  profileImage: z.instanceof(File).optional().or(z.string().optional()),
  tournamentId: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface TeamFormProps {
  mode: "create" | "edit";
  teamId?: string;
  initialData?: any;
}

const TeamForm: React.FC<TeamFormProps> = ({ mode, teamId, initialData }) => {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const preselectedTournamentId = searchParams.get("tournamentId") || "";
  const { user: currentUser } = useApp();

  // Get teamId from URL params if not provided as prop
  const actualTeamId = teamId || params.teamId;
  const [formError, setFormError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(defaultTeamImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    mutate: createTeam,
    isPending: isCreating,
    isError: isCreateError,
    error: createError,
  } = useCreateTeam();

  const {
    mutate: updateTeam,
    isPending: isUpdating,
    isError: isUpdateError,
    error: updateError,
  } = useUpdateTeam();

  // Get team data for edit mode
  const { data: team, isLoading: isTeamLoading } = useTeam(actualTeamId || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: { tournamentId: preselectedTournamentId },
  });

  // Watch the team name for validation
  const teamName = watch("name");

  // Check if team name already exists
  const { data: nameCheckData, isLoading: isCheckingName } =
    useCheckTeamName(teamName, mode === "edit" ? actualTeamId : undefined);
  const nameExists = nameCheckData?.exists;

  // Fetch tournaments for selection (only needed in create mode)
  const { data: tournaments = [], isLoading: isLoadingTournaments } = useTournaments();

  // Registration mutation
  const { mutate: createRegistration, isPending: isRegistering } = useCreateRegistration();

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === "edit" && team) {
      reset({
        name: team.name || "",
        referentName: team.referentName || "",
        referentPhoneNumber: team.referentPhoneNumber || "",
        referentEmail: team.referentEmail || "",
        coach: team.coach || "",
        profileImage:
          typeof team.profileImage === "string" ? team.profileImage : undefined,
      });
      setImagePreview(
        typeof team.profileImage === "string" ? team.profileImage : defaultTeamImage
      );
    }
  }, [mode, team, reset]);

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
    setFormError("");

    // Prevent submission if team name already exists
    if (nameExists) {
      setFormError(
        "El nombre del equipo ya está en uso. Por favor, elija otro nombre."
      );
      return;
    }

    // Add the current user as creator for create mode
    const teamData: any = {
      ...data,
      createdById: currentUser?.id || "",
    };
    delete teamData.tournamentId; // Not part of Team entity

    // Decide to which page redirect after create
    const redirectAfterCreate = preselectedTournamentId
      ? `/divisions/${preselectedTournamentId}/registrations`
      : "/teams";

    if (mode === "create") {
      createTeam(teamData, {
        onSuccess: (newTeam) => {
          if (data.tournamentId) {
            createRegistration(
              { teamId: newTeam._id, tournamentId: data.tournamentId },
              {
                onSuccess: () => navigate(redirectAfterCreate),
                onError: (error: any) => {
                  setFormError(
                    error.response?.data?.message ||
                      "Error al registrar el equipo en la division"
                  );
                },
              }
            );
          } else {
            navigate(redirectAfterCreate);
          }
        },
        onError: (error: any) => {
          setFormError(
            error.response?.data?.message || "Error al crear el equipo"
          );
        },
      });
    } else {
      // For update mode, handle FormData if there's a new image
      let payload: any = {};
      let isFormData = false;

      if (data.profileImage instanceof File) {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("referentName", data.referentName);
        if (data.referentPhoneNumber) formData.append("referentPhoneNumber", data.referentPhoneNumber);
        if (data.referentEmail) formData.append("referentEmail", data.referentEmail);
        if (data.coach) formData.append("coach", data.coach);
        formData.append("profileImage", data.profileImage);
        payload = formData;
        isFormData = true;
      } else {
        payload = {
          name: data.name,
          referentName: data.referentName,
          referentPhoneNumber: data.referentPhoneNumber || undefined,
          referentEmail: data.referentEmail || undefined,
          coach: data.coach || undefined,
          profileImage: data.profileImage,
        };
      }

      updateTeam(
        {
          id: actualTeamId!,
          data: payload,
          isFormData,
        },
        {
          onSuccess: () => navigate("/teams"),
          onError: (error: any) => {
            setFormError(
              error.response?.data?.message || "Error al actualizar el equipo"
            );
          },
        }
      );
    }
  };

  const isPending = isCreating || isUpdating || isRegistering || isLoadingTournaments;
  const isError = isCreateError || isUpdateError;
  const apiError = createError || updateError;

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
            <h1 className="text-xl font-bold">
              {mode === "create" ? "Crear Nuevo Equipo" : "Editar Equipo"}
            </h1>
          </div>

          <div className="flex justify-end px-6 pt-4">
            <div
              className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 border-2 border-blue-400 -mt-10 -mb-5"
              onClick={() => fileInputRef.current?.click()}
              title="Seleccionar escudo del equipo"
            >
              <img
                src={imagePreview || defaultTeamImage}
                alt="Escudo del equipo"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {formError}
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
                  disabled={isPending}
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
                Nombre Completo del Delegado
              </label>
              <input
                id="captainFullName"
                type="text"
                {...register("referentName")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el nombre completo del delegado"
                disabled={isPending}
              />
              {errors.referentName && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.referentName.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="captainPhoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Teléfono del Delegado
              </label>
              <input
                id="captainPhoneNumber"
                type="text"
                {...register("referentPhoneNumber")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el teléfono del delegado"
                disabled={isPending}
              />
              {errors.referentPhoneNumber && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.referentPhoneNumber.message}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="captainEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Electrónico del Delegado
              </label>
              <input
                id="captainEmail"
                type="email"
                {...register("referentEmail")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese el correo electrónico del delegado"
                disabled={isPending}
              />
              {errors.referentEmail && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.referentEmail.message}
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
                disabled={isPending}
              />
              {errors.coach && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.coach.message}
                </div>
              )}
            </div>

            {mode === "create" && (
              <div className="mb-4">
                <label
                  htmlFor="tournamentId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Division
                </label>
                <select
                  id="tournamentId"
                  {...register("tournamentId")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isPending}
                >
                  <option value="">Seleccione una division</option>
                  {tournaments.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.tournamentId && (
                  <div className="text-red-600 text-sm mt-1">
                    {errors.tournamentId.message}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate("/teams")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isPending
                  ? "Guardando..."
                  : mode === "create"
                  ? "Crear Equipo"
                  : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default TeamForm;
