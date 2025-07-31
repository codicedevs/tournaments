import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "../components/layout/Header";
import { ArrowLeftIcon, Upload, PlusIcon, Star } from "lucide-react";
import { useTeam, useUpdateTeam, useTeamPlayers } from "../api/teamHooks";
import { useUser } from "../api/userHooks";
import { usePlayers } from "../api/playerHooks";
import RegisterPlayer from "./RegisterPlayer";
import { Modal } from "antd";

const teamSchema = z.object({
  name: z.string().min(1, "El nombre del equipo es requerido"),
  coach: z.string().optional(),
  profileImage: z.instanceof(File).optional().or(z.string().optional()),
});

type TeamFormData = z.infer<typeof teamSchema>;

const EditTeamForm: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Get team data
  const { data: team, isLoading: isTeamLoading } = useTeam(teamId || "");
  // Get players of the team
  const { data: players = [], isLoading: isPlayersLoading } =
    useTeamPlayers(teamId);

  // Get creator user (for display)
  const creatorId =
    typeof team?.createdById === "string"
      ? team.createdById
      : team?.createdById?._id || "";
  const { data: creator } = useUser(creatorId);

  // Update mutation
  const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
  });

  // Reset form when team data is loaded
  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        coach: team.coach || "",
        profileImage:
          typeof team.profileImage === "string" ? team.profileImage : undefined,
      } as TeamFormData);
      setImagePreview(
        typeof team.profileImage === "string" ? team.profileImage : null
      );
    }
  }, [team, reset]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue("profileImage", file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: TeamFormData) => {
    if (!teamId) {
      setError("ID de equipo no encontrado");
      return;
    }

    // Si el usuario subió un archivo, enviamos FormData
    let payload: any = {};
    let isFormData = false;
    if (data.profileImage instanceof File) {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.coach) formData.append("coach", data.coach);
      formData.append("profileImage", data.profileImage);
      payload = formData;
      isFormData = true;
    } else {
      payload = {
        name: data.name,
        coach: data.coach || undefined,
        profileImage: data.profileImage,
      };
    }

    updateTeam(
      {
        id: teamId,
        data: payload,
        isFormData,
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

  // PATCH para asignar delegado (capitán)
  const handleSetCaptain = (userId: string) => {
    if (!teamId) return;
    updateTeam(
      {
        id: teamId,
        data: { captain: userId as string },
        isFormData: false,
      },
      {
        onSuccess: () => {
          // Refresca la vista automáticamente por react-query
        },
        onError: (error) => {
          setError("Error al asignar delegado");
        },
      }
    );
  };

  const isLoading = isTeamLoading || isUpdating;

  return (
    <div className="min-h-screen bg-gray-50 relative">
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

          <div className="flex justify-end px-6 pt-4">
            <div
              className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 border-2 border-blue-400 -mt-10 -mb-5"
              onClick={() => fileInputRef.current?.click()}
              title="Seleccionar escudo del equipo"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Escudo del equipo"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Escudo</span>
              )}
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
                <div className="text-red-600 text-sm mt-1">
                  {errors.name.message}
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
                disabled={isLoading}
              />
              {errors.coach && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.coach.message}
                </div>
              )}
            </div>

            {/* Información del delegado actual */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delegado Actual
              </label>
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700">
                {team?.captain
                  ? typeof team.captain === "object"
                    ? team.captain.name
                    : "Delegado asignado"
                  : "Sin delegado asignado"}
              </div>
            </div>

            {/* Lista de jugadores */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-lg font-semibold text-gray-700">
                  Jugadores
                </label>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1 text-blue-600 hover:underline bg-transparent p-0 font-medium"
                >
                  <PlusIcon className="w-4 h-4" />
                  Registrar jugador
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {isPlayersLoading ? (
                  <div className="text-gray-500">Cargando jugadores...</div>
                ) : players.length === 0 ? (
                  <div className="text-gray-500">
                    No hay jugadores en este equipo.
                  </div>
                ) : (
                  players.map((p: any) => {
                    const isCaptain = team?.captain === p.user?._id;
                    const isSelected = selectedPlayerId === p.user?._id;
                    return (
                      <div
                        key={p.user?._id || p._id}
                        className={`flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 hover:bg-blue-50 cursor-pointer transition relative ${
                          isSelected ? "ring-2 ring-blue-400" : ""
                        }`}
                        onClick={() => setSelectedPlayerId(p.user._id)}
                      >
                        {p.user?.profilePicture ? (
                          <img
                            src={p.user.profilePicture}
                            alt={p.user.name}
                            className="h-8 w-8 rounded-full object-cover cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/users/${p.user._id}/edit`);
                            }}
                          />
                        ) : (
                          <div
                            className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/users/${p.user._id}/edit`);
                            }}
                          >
                            {p.user?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                        <span
                          className="font-medium text-gray-800 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${p.user._id}/edit`);
                          }}
                        >
                          {p.user ? p.user.name : p.name}
                        </span>
                        <div className="ml-auto flex items-center">
                          {isCaptain && (
                            <span
                              title="Delegado"
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-white font-bold text-xs"
                            >
                              D
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Botón para asignar delegado */}
            {selectedPlayerId && (
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-yellow-400 text-white font-semibold hover:bg-yellow-500 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleSetCaptain(selectedPlayerId)}
                  disabled={team?.captain === selectedPlayerId}
                >
                  Asignar como Delegado
                </button>
              </div>
            )}

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
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isUpdating ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Modal para registrar jugador usando antd */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        title="Registrar Jugador"
        destroyOnClose
      >
        <RegisterPlayer
          teamId={teamId}
          onSuccess={() => {
            setIsModalOpen(false);
          }}
          hideLayout={true}
        />
      </Modal>
    </div>
  );
};

export default EditTeamForm;
