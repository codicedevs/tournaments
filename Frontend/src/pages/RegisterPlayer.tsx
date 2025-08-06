import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import { ArrowLeftIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTeams } from "../api/teamHooks";
import { useCreateUserWithPlayer } from "../api/userHooks";
import axios from "axios";
import { API_BASE_URL } from "../config";

// Zod schema – only name & DNI are obligatorios
const playerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  dni: z.string().min(1, "El DNI es requerido"),
  teamId: z.string().optional(),
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface RegisterPlayerProps {
  teamId?: string;
  onSuccess?: () => void;
  hideLayout?: boolean;
}

const RegisterPlayer: React.FC<RegisterPlayerProps> = ({
  teamId: propTeamId,
  onSuccess,
  hideLayout = false,
}) => {
  const navigate = useNavigate();
  const { teamId: paramTeamId } = useParams<{ teamId: string }>();
  const currentTeamId = propTeamId || paramTeamId || undefined;

  const { data: teams = [] } = useTeams();
  const { mutate: createPlayer, isPending } = useCreateUserWithPlayer();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      teamId: currentTeamId,
    },
  });

  useEffect(() => {
    if (currentTeamId) {
      setValue("teamId", currentTeamId);
    }
  }, [currentTeamId, setValue]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));

      const formDataFile = new FormData();
      formDataFile.append("file", file);
      try {
        const res = await axios.post(
          `${API_BASE_URL}/users/upload`,
          formDataFile,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setProfilePictureUrl(res.data.url);
      } catch (err) {
        alert("Error subiendo la imagen de perfil");
      }
    }
  };

  const onSubmit = (data: PlayerFormData) => {
    const username = `jugador${data.dni}`;
    const password = "usuario123";

    createPlayer(
      {
        ...data,
        username,
        password,
        role: "Player",
        profilePicture: profilePictureUrl || undefined,
        mustChangePassword: true,
        isVerified: true,
      } as any,
      {
        onSuccess: () => {
          onSuccess
            ? onSuccess()
            : navigate(
                currentTeamId ? `/teams/${currentTeamId}/players` : "/players"
              );
        },
        onError: (err: any) => {
          alert(err.response?.data?.message || "Error al registrar jugador");
        },
      }
    );
  };

  const backRoute = currentTeamId
    ? `/teams/${currentTeamId}/players`
    : "/players";

  const FormCore = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Avatar */}
      <div className="flex justify-center">
        <div
          className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 border-2 border-blue-400"
          onClick={handleAvatarClick}
          title="Seleccionar avatar"
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-400">Avatar</span>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Nombre */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nombre del Jugador
        </label>
        <input
          type="text"
          id="name"
          {...register("name")}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Ingresa el nombre completo"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* DNI */}
      <div>
        <label
          htmlFor="dni"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          DNI
        </label>
        <input
          type="text"
          id="dni"
          {...register("dni")}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Ingresa el número de DNI"
        />
        {errors.dni && (
          <p className="mt-1 text-sm text-red-600">{errors.dni.message}</p>
        )}
      </div>

      {/* Equipo (solo si no viene de contexto) */}
      {!propTeamId && (
        <div>
          <label
            htmlFor="teamId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Equipo
          </label>
          <select
            id="teamId"
            {...register("teamId")}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Sin equipo</option>
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isPending ? "Registrando..." : "Registrar Jugador"}
      </button>
    </form>
  );

  if (hideLayout) return FormCore;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(backRoute)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Registrar Jugador
            </h1>
            <p className="text-gray-600">
              Crea un nuevo usuario con rol Player
            </p>
          </div>
        </div>

        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-xl font-bold">Nuevo Jugador</h1>
          </div>
          <div className="p-6">{FormCore}</div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPlayer;
