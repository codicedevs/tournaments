import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import { User, UserRole } from "../models/User";
import { useUser, useUpdateUser } from "../api/userHooks";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { usePlayerByUserId } from "../api/playerHooks";

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useUser(id || "");
  const [form, setForm] = useState<User | null>(null);
  const updateUser = useUpdateUser();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: playerData, isLoading: loadingPlayer } = usePlayerByUserId(
    form?._id
  );

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!form) return;
    const { name, value, type } = e.target;
    let newValue: any = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      newValue = e.target.checked;
    }
    setForm({
      ...form,
      [name]: newValue,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && form) {
      setPreviewUrl(URL.createObjectURL(file));
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
        setForm({ ...form, profilePicture: res.data.url });
      } catch (err) {
        alert("Error subiendo la imagen de perfil");
      }
    }
  };

  const handleSave = () => {
    if (!form) return;
    updateUser.mutate(form, {
      onSuccess: () => {
        navigate("/users");
      },
      onError: () => {
        alert("Error al actualizar el usuario");
      },
    });
    navigate("/users");
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) return <div className="p-8">Cargando usuario...</div>;
  if (isError)
    return <div className="p-8 text-red-600">No se pudo cargar el usuario</div>;
  if (!form) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            ← Volver
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-800">Editar usuario</h1>
        </div>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* Imagen de perfil arriba, centrada */}
          <div className="flex flex-col items-center pt-8 pb-2">
            <div
              className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 border-2 border-blue-400 mb-3"
              onClick={handleImageClick}
              title="Cambiar foto de perfil"
            >
              {previewUrl || form?.profilePicture ? (
                <img
                  src={previewUrl || form?.profilePicture}
                  alt="Foto de perfil"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Foto</span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {/* Nombre como título grande y centrado */}
            <h2 className="text-2xl font-bold text-gray-800 mt-2 mb-1 text-center">
              {form?.name || "Usuario"}
            </h2>
            {/* Equipo del jugador */}
            <div className="text-md text-gray-600 mb-4 text-center">
              {loadingPlayer
                ? "Cargando equipo..."
                : playerData &&
                  playerData.length > 0 &&
                  playerData[0].teamId &&
                  playerData[0].teamId.name
                ? playerData[0].teamId.name
                : "Sin equipo"}
            </div>
          </div>
          <form className="p-8">
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Correo
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Rol
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">
                Teléfono
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                name="isVerified"
                checked={!!form.isVerified}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-gray-700 font-semibold">Verificado</label>
            </div>
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
                disabled={updateUser.status === "pending"}
              >
                Guardar
              </button>
              <button
                onClick={() => navigate("/users")}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-semibold"
                disabled={updateUser.status === "pending"}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserEdit;
