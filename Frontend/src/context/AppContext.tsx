import React, { useState, createContext, useContext, ReactNode } from "react";
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
interface AppContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  // Al montar, revisa si hay token
  React.useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);
  // Mock login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // Aquí deberías hacer la petición real al backend
    // const response = await api.login(email, password);
    // if (response.ok) {
    //   const token = response.token;
    //   localStorage.setItem("authToken", token);
    //   setToken(token);
    //   setIsAuthenticated(true);
    //   return true;
    // }
    // return false;

    // Mock para MVP:
    if (email && password) {
      const fakeToken = "token_de_ejemplo";
      localStorage.setItem("authToken", fakeToken);
      setToken(fakeToken);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem("authToken");
  };
  const addTournament = (name: string) => {
    const newTournament: Tournament = {
      id: Date.now().toString(),
      name,
    };
    setTournaments([...tournaments, newTournament]);
  };
  const addTeam = (name: string) => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
    };
    setTeams([...teams, newTeam]);
  };
  const addPlayer = (name: string) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
    };
    setPlayers([...players, newPlayer]);
  };
  const checkAuth = async () => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      setIsAuthenticated(false);
      setToken(null);
      // setUser(null); // si tienes estado de usuario
      return false;
    }
    try {
      // Aquí harías la petición real al backend
      // const response = await fetch("/api/auth/me", {
      //   headers: { Authorization: `Bearer ${storedToken}` }
      // });
      // if (response.ok) {
      //   const userData = await response.json();
      //   setIsAuthenticated(true);
      //   setToken(storedToken);
      //   setUser(userData);
      //   return true;
      // }
      // throw new Error("Token inválido");

      // Mock para MVP:
      setIsAuthenticated(true);
      setToken(storedToken);
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      setToken(null);
      localStorage.removeItem("authToken");
      // setUser(null);
      return false;
    }
  };
  const value = {
    isAuthenticated,
    login,
    logout,
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
