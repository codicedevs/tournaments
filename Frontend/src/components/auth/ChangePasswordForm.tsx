import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useChangePassword } from "../../api/authHooks";

interface ChangePasswordFormProps {
  isFirstLogin?: boolean;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  isFirstLogin = false,
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();
  const { logout } = useApp();
  const { changePassword, loading, error } = useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validaciones
    if (!isFirstLogin && !oldPassword) {
      setValidationError("La contraseña actual es requerida");
      return;
    }

    if (newPassword.length < 6) {
      setValidationError(
        "La nueva contraseña debe tener al menos 6 caracteres"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Las contraseñas no coinciden");
      return;
    }

    const success = await changePassword({
      oldPassword: isFirstLogin ? undefined : oldPassword,
      newPassword,
      confirmPassword,
    });

    if (success) {
      // Si es el primer login, redirigir al dashboard
      if (isFirstLogin) {
        navigate("/dashboard");
      } else {
        // Si no es el primer login, cerrar sesión para que vuelva a loguearse
        logout();
        navigate("/login");
      }
    }
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {isFirstLogin
              ? "Cambio de Contraseña Requerido"
              : "Cambiar Contraseña"}
          </h1>
          <p className="mt-2 text-gray-600">
            {isFirstLogin
              ? "Por seguridad, debe cambiar su contraseña antes de continuar"
              : "Ingrese su contraseña actual y la nueva contraseña"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {displayError}
            </div>
          )}

          {!isFirstLogin && (
            <div>
              <label
                htmlFor="oldPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña Actual
              </label>
              <input
                id="oldPassword"
                name="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Nueva Contraseña
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirmar Nueva Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Cambiando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
