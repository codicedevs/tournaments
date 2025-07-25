import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import { ArrowLeftIcon, UploadIcon } from "lucide-react";
import { useTeams, useAddPlayerToTeam } from "../api/teamHooks";
import { RegisterPlayerData } from "../api/playerHooks";
import axios from "axios";
import { API_BASE_URL } from "../config";

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
  const { data: teams = [] } = useTeams();
  const { mutate: addPlayerToTeam, isPending } = useAddPlayerToTeam();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<RegisterPlayerData>({
    name: "",
    email: "",
    password: "",
    phone: "",
    teamId: propTeamId || paramTeamId || "",
    profilePicture: undefined,
  });

  // Si la prop teamId cambia, actualiza el formData
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      teamId: propTeamId || paramTeamId || "",
    }));
  }, [propTeamId, paramTeamId]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teamId) {
      alert("Por favor selecciona un equipo");
      return;
    }

    addPlayerToTeam(
      { teamId: formData.teamId, playerData: formData },
      {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate(`/teams/${formData.teamId}/players`);
          }
        },
        onError: (error) => {
          console.error(
            "Error registrando y agregando jugador al equipo:",
            error
          );
          alert("Error al registrar el jugador");
        },
      }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      // Subir la imagen al backend
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
        setFormData((prev) => ({
          ...prev,
          profilePicture: res.data.url,
        }));
      } catch (err) {
        alert("Error subiendo la imagen de perfil");
      }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  if (hideLayout) {
    return (
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* Datos Personales */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Datos Personales
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div
                onClick={handleImageClick}
                className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UploadIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex-1">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Datos de Inicio de Sesión */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Datos de Inicio de Sesión
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Selección de Equipo */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Equipo</h2>
          <div>
            <select
              id="teamId"
              name="teamId"
              required
              value={formData.teamId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={!!propTeamId}
            >
              {propTeamId ? (
                teams
                  .filter((team) => team._id === propTeamId)
                  .map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))
              ) : (
                <>
                  <option value="">Selecciona un equipo</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isPending ? "Registrando..." : "Registrar Jugador"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/teams/${propTeamId}/players`)}
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
            <p className="text-gray-600">Crea una nueva cuenta de jugador</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6"
          >
            {/* Datos Personales */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Datos Personales
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <div
                    onClick={handleImageClick}
                    className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UploadIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Datos de Inicio de Sesión */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Datos de Inicio de Sesión
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Selección de Equipo */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Equipo</h2>
              <div>
                <select
                  id="teamId"
                  name="teamId"
                  required
                  value={formData.teamId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={!!propTeamId}
                >
                  {propTeamId ? (
                    teams
                      .filter((team) => team._id === propTeamId)
                      .map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))
                  ) : (
                    <>
                      <option value="">Selecciona un equipo</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isPending ? "Registrando..." : "Registrar Jugador"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegisterPlayer;
