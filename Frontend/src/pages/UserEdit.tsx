import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import { User, UserRole } from "../models/User";
import { useUser, useUpdateUser } from "../api/userHooks";

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useUser(id || "");
  const [form, setForm] = useState<User | null>(null);
  const updateUser = useUpdateUser();

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

  const handleSave = () => {
    if (!form) return;
    updateUser.mutate(form, {
      onSuccess: () => {
        alert("Usuario actualizado correctamente");
        navigate(-1);
      },
      onError: () => {
        alert("Error al actualizar el usuario");
      },
    });
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
        <div className="bg-white rounded-lg shadow p-8 max-w-xl mx-auto">
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
          {/* Foto de perfil (solo muestra la URL, podrías mejorar esto) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-1">
              Foto de perfil (URL)
            </label>
            <input
              type="text"
              name="profilePicture"
              value={form.profilePicture || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
            {form.profilePicture && (
              <img
                src={form.profilePicture}
                alt="Foto de perfil"
                className="mt-2 w-20 h-20 rounded-full object-cover"
              />
            )}
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
              onClick={() => navigate(-1)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded font-semibold"
              disabled={updateUser.status === "pending"}
            >
              Cancelar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserEdit;
