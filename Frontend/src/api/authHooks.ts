import { useState } from "react";
import { api } from "./api";

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email?: string;
    username?: string;
    name: string;
    role: string;
    mustChangePassword: boolean;
    isVerified: boolean;
  };
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (
    identifier: string,
    password: string
  ): Promise<LoginResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email: identifier, // Mantenemos el nombre del campo por compatibilidad con el backend
        password,
      });
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Error al iniciar sesión";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = async (
    data: ChangePasswordRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await api.post("/auth/change-password", data);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Error al cambiar la contraseña";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error };
};

export const useGetProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Error al obtener el perfil";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getProfile, loading, error };
};
