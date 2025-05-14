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
}
const AppContext = createContext<AppContextType | undefined>(undefined);
export const AppProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  // Mock login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // For MVP, accept any non-empty email and password
    if (email && password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  const logout = () => {
    setIsAuthenticated(false);
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
