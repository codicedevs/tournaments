import axios from "axios";

// Base URL can be configured via environment variable or default to localhost
export const http = axios.create({
  baseURL: "http://localhost:6969",
  //withCredentials: true,
});

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    profilePicture?: string;
  };
}

// ----------  Players  ----------
export interface Player {
  id: string;
  name: string;
  position: string;
  teamId: Team | null;
  stats?: {
    goals: number;
    redCards: number;
    yellowCards: number;
    blueCards: number;
    assists: number;
    matchesPlayed: number;
  };
}

// ----------  Teams  ----------
export interface Team {
  _id: string;
  name: string;
  division: string;
}

// ----------  Matches  ----------
export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  phaseId: string;
  teamA: Team;
  teamB: Team;
}

// ----------  Tournaments  ----------
export interface Tournament {
  id: string;
  name: string;
  season: string;
}

export const playersApi = {
  getAll: async () => {
    const { data } = await http.get<Player[]>("/players");
    return data;
  },

  getByUser: async () => {
    const { data } = await http.get<Player[]>("/players/my-players");
    return data;
  },

  getByUserId: async (userId: string) => {
    const { data } = await http.get<Player[]>(`/players/by-user/${userId}`);
    return data;
  },

  create: async (payload: Partial<Player>) => {
    const { data } = await http.post<Player>("/players", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Player>) => {
    const { data } = await http.patch<Player>(`/players/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    await http.delete<void>(`/players/${id}`);
  },
};

export const teamsApi = {
  getAll: async () => {
    const { data } = await http.get<Team[]>("/teams");
    return data;
  },

  create: async (payload: Partial<Team>) => {
    const { data } = await http.post<Team>("/teams", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Team>) => {
    const { data } = await http.patch<Team>(`/teams/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    await http.delete<void>(`/teams/${id}`);
  },

  checkName: async (name: string) => {
    const { data } = await http.get<boolean>("/teams/check-name", {
      params: { name },
    });
    return data;
  },

  players: async (teamId: string) => {
    const { data } = await http.get<Player[]>(`/teams/${teamId}/players`);
    return data;
  },
};

export const matchesApi = {
  getAll: async () => {
    const { data } = await http.get<Match[]>("/matches");
    return data;
  },

  getById: async (id: string) => {
    const { data } = await http.get<Match>(`/matches/${id}`);
    return data;
  },

  findByTeam: async (teamId: string) => {
    const { data } = await http.get<Match[]>(`/matches/by-team/${teamId}`);
    return data;
  },

  create: async (payload: Partial<Match>) => {
    const { data } = await http.post<Match>("/matches", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Match>) => {
    const { data } = await http.patch<Match>(`/matches/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    await http.delete<void>(`/matches/${id}`);
  },
};

export const tournamentsApi = {
  getAll: async () => {
    const { data } = await http.get<Tournament[]>("/tournaments");
    return data;
  },

  getById: async (id: string) => {
    const { data } = await http.get<Tournament>(`/tournaments/${id}`);
    return data;
  },

  create: async (payload: Partial<Tournament>) => {
    const { data } = await http.post<Tournament>("/tournaments", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Tournament>) => {
    const { data } = await http.patch<Tournament>(
      `/tournaments/${id}`,
      payload
    );
    return data;
  },

  remove: async (id: string) => {
    await http.delete<void>(`/tournaments/${id}`);
  },
};

// Export aggregated api object for convenience
export const api = {
  login: async (email: string, password: string) => {
    const { data } = await http.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },
  players: playersApi,
  teams: teamsApi,
  matches: matchesApi,
  tournaments: tournamentsApi,
};
