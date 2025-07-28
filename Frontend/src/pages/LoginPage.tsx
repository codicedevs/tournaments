import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useLogin } from "../api/authHooks";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, setToken } = useApp();
  const { login: apiLogin, loading, error: apiError } = useLogin();

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    if (email || password) {
      setValidationError("");
    }
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validaciones básicas
    if (!email || !password) {
      setValidationError("Por favor complete todos los campos");
      return;
    }

    if (!email.includes("@")) {
      setValidationError("Por favor ingrese un email válido");
      return;
    }

    try {
      const loginResponse = await apiLogin(email, password);

      if (loginResponse) {
        // Guardar token y datos del usuario
        localStorage.setItem("authToken", loginResponse.access_token);
        setToken(loginResponse.access_token);
        setUser(loginResponse.user);
        setIsAuthenticated(true);

        // Redirigir según si debe cambiar contraseña
        if (loginResponse.user.mustChangePassword) {
          navigate("/change-password", { state: { isFirstLogin: true } });
        } else {
          navigate("/dashboard");
        }
      }
      // Si loginResponse es null, el hook ya maneja el error
    } catch (error) {
      console.error("Error en login:", error);
      setValidationError(
        "Error al iniciar sesión. Verifique sus credenciales."
      );
    }
  };

  // Mostrar error de validación o de API
  const displayError = validationError || apiError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
          <p className="mt-2 text-gray-600">
            Ingrese sus credenciales para acceder al sistema
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {displayError}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="usuario@ejemplo.com"
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
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
