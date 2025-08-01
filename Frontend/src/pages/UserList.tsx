import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { PlusIcon, ArrowLeftIcon, Trash2Icon } from "lucide-react";
import { useUsers, useDeleteUser, useDeleteUsers } from "../api/userHooks";
import { UserRole, roleLabels } from "../models/User";

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { data: users = [], isLoading, isError } = useUsers();
  const [selected, setSelected] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const deleteUser = useDeleteUser();
  const deleteUsers = useDeleteUsers();

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selected.length === 0) return;
    if (
      window.confirm(`¿Seguro que deseas borrar ${selected.length} usuario(s)?`)
    ) {
      deleteUsers.mutate(selected, { onSuccess: () => setSelected([]) });
    }
  };

  const handleDeleteOne = (id: string) => {
    if (window.confirm("¿Seguro que deseas borrar este usuario?")) {
      deleteUser.mutate(id, {
        onSuccess: () =>
          setSelected((prev) => prev.filter((sid) => sid !== id)),
      });
    }
  };

  // Filtrar y ordenar usuarios
  const filteredUsers = users
    .filter((user: any) => (roleFilter ? user.role === roleFilter : true))
    .sort((a: any, b: any) => {
      if (sortAsc) {
        return a.role.localeCompare(b.role);
      } else {
        return b.role.localeCompare(a.role);
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon size={16} />
            <span>Volver al Panel</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Lista de usuarios
            </h1>
            <p className="text-gray-600">
              Aquí se muestran todos los usuarios del sistema y su rol.
            </p>
          </div>
        </div>
        <div className="flex justify-end items-center mb-6">
          <button
            onClick={() => navigate("/users/new")}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
          >
            <PlusIcon size={18} />
            <span>Crear Usuario</span>
          </button>
        </div>
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">Cargando jugadores...</p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 mb-4">Error al cargar jugadores.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No hay jugadores disponibles.</p>
            <button
              onClick={() => navigate("/users/new")}
              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              <PlusIcon size={18} />
              <span>Crear Primer Jugador</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selected.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onChange={() => {
                        if (selected.length === filteredUsers.length) {
                          setSelected([]);
                        } else {
                          setSelected(
                            filteredUsers.map((user: any) => user._id)
                          );
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-40 border border-gray-300 rounded px-2 py-1 text-xs font-medium uppercase tracking-wider text-gray-500 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Todos los roles</option>
                      {Object.values(UserRole).map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user: any) => (
                  <tr
                    key={user._id}
                    className={selected.includes(user._id) ? "bg-blue-50" : ""}
                  >
                    <td className="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(user._id)}
                        onChange={() => toggleSelect(user._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                      onClick={() => navigate(`/users/${user._id}/edit`)}
                    >
                      {user.name}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                      onClick={() => navigate(`/users/${user._id}/edit`)}
                    >
                      {user.email}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                      onClick={() => navigate(`/users/${user._id}/edit`)}
                    >
                      {roleLabels[user.role as UserRole] || user.role}
                    </td>
                    <td className="px-2 py-4 text-center">
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOne(user._id);
                        }}
                        title="Borrar usuario"
                      >
                        <Trash2Icon size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selected.length > 0 && (
          <div className="my-4 flex justify-end">
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow"
              onClick={handleDeleteSelected}
              disabled={deleteUsers.isPending}
            >
              Borrar seleccionados ({selected.length})
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserList;
