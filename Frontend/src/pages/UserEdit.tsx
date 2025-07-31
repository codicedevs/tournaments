import React from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../api/userHooks";
import UserForm from "../components/users/UserForm";

const UserEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, isError } = useUser(id || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Error al cargar
          </h3>
          <p className="text-gray-600">No se pudo cargar el usuario</p>
        </div>
      </div>
    );
  }

  return <UserForm mode="edit" userId={id} initialData={user} />;
};

export default UserEdit;
