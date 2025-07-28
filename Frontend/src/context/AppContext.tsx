import React, { useState, createContext, useContext, ReactNode } from "react";
import { useLogin, useGetProfile } from "../api/authHooks";

// Define types for our data
export interface Tournament {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  mustChangePassword: boolean;
  isVerified: boolean;
}

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; mustChangePassword?: boolean }>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setToken: (token: string | null) => void;
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
  addTournament: (name: string) => void;
  addTeam: (name: string) => void;
  addPlayer: (name: string) => void;
  checkAuth: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  // Usar hooks para las operaciones de autenticación
  const { login: apiLogin } = useLogin();
  const { getProfile } = useGetProfile();

  // Al montar, revisa si hay token
  React.useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      checkAuth();
    }
  }, []);

  // Función de login usando el hook
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; mustChangePassword?: boolean }> => {
    try {
      const loginResponse = await apiLogin(email, password);

      if (loginResponse) {
        localStorage.setItem("authToken", loginResponse.access_token);
        setToken(loginResponse.access_token);
        setUser(loginResponse.user);
        setIsAuthenticated(true);

        return {
          success: true,
          mustChangePassword: loginResponse.user.mustChangePassword,
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error("Error en login:", error);
      return { success: false };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  const addTournament = (name: string) => {
    const newTournament: Tournament = {
      id: Date.now().toString(),
      name,
    };
    setTournaments((prev) => [...prev, newTournament]);
  };

  const addTeam = (name: string) => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
    };
    setTeams((prev) => [...prev, newTeam]);
  };

  const addPlayer = (name: string) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
    };
    setPlayers((prev) => [...prev, newPlayer]);
  };

  const checkAuth = async () => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      return false;
    }

    try {
      const userData = await getProfile();

      if (userData) {
        setIsAuthenticated(true);
        setUser(userData);
        setToken(storedToken);
        return true;
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        localStorage.removeItem("authToken");
        return false;
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      localStorage.removeItem("authToken");
      return false;
    }
  };

  const value: AppContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    setUser,
    setIsAuthenticated,
    setToken,
    tournaments,
    teams,
    players,
    addTournament,
    addTeam,
    addPlayer,
    checkAuth,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
