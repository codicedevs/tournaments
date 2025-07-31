import axios from "axios";

// Base URL can be configured via environment variable or default to localhost
export const http = axios.create({
  baseURL: "http://localhost:6969",
  //withCredentials: true,
});

export interface LoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
    role: string;
    profilePicture?: string;
  };
}

// ----------  Players  ----------
export interface Player {
  _id: string;
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
  division?: string;
  profileImage?: string;
  players?: Player[];
}

// ----------  Matches  ----------
export interface Match {
  _id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  phaseId: string;
  teamA: Team;
  teamB: Team;
}

// ----------  Tournaments  ----------
export interface Tournament {
  _id: string;
  name: string;
  season: string;
  phases?: Phase[];
}

// ----------  Phases  ----------
export interface Phase {
  _id: string;
  name: string;
  type: string;
  tournamentId: string;
}

// ----------  Matchdays  ----------
export interface Matchday {
  _id: string;
  order: number;
  date?: string;
  phaseId: string | Phase;
  matches?: Match[];
}

// ----------  Registrations  ----------
export interface Registration {
  _id: string;
  teamId: string;
  tournamentId: string;
  phaseId?: string;
  stats: TeamStats;
}

// ----------  TeamStats  ----------
export interface TeamStats {
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  yellowCards: number;
  redCards: number;
  blueCards: number;
  fairPlayScore: number;
  goalDifference: number;
  scoreWeight: number;
}

export const registrationApi = {
  getAll: async () => {
    const { data } = await http.get<Registration[]>("/registrations");
    return data;
  },

  getByTournament: async (tournamentId: string) => {
    const { data } = await http.get<Registration[]>(
      `/registrations/tournament/${tournamentId}`
    );
    return data;
  },

  getByTeam: async (teamId: string) => {
    const { data } = await http.get<Registration[]>(
      `/registrations/team/${teamId}`
    );
    return data;
  },

  create: async (payload: Partial<Registration>) => {
    const { data } = await http.post<Registration>("/registrations", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Registration>) => {
    const { data } = await http.patch<Registration>(
      `/registrations/${id}`,
      payload
    );
    return data;
  },

  remove: async (id: string) => {
    await http.delete<void>(`/registrations/${id}`);
  },
};

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

  getByTournament: async (tournamentId: string) => {
    const { data } = await http.get<Player[]>(
      `/players/by-tournament/${tournamentId}`
    );
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

export const phasesApi = {
  getAll: async () => {
    const { data } = await http.get<Phase[]>("/phases");
    return data;
  },

  getById: async (id: string) => {
    const { data } = await http.get<Phase>(`/phases/${id}`);
    return data;
  },

  findByTournament: async (tournamentId: string) => {
    const { data } = await http.get<Phase[]>(
      `/phases/tournament/${tournamentId}`
    );
    return data;
  },

  create: async (payload: Partial<Phase>) => {
    const { data } = await http.post<Phase>("/phases", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Phase>) => {
    const { data } = await http.patch<Phase>(`/phases/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    await http.delete<void>(`/phases/${id}`);
  },
};

export const matchdaysApi = {
  findByPhase: async (phaseId: string) => {
    const { data } = await http.get<Matchday[]>(`/matchdays/phase/${phaseId}`);
    return data;
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
  phases: phasesApi,
  matchdays: matchdaysApi,
};
