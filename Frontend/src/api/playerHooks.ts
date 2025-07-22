import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { User } from "../models";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

export const getPlayers = async (): Promise<User[]> => {
  const res = await axios.get(`${API_BASE}/users`);
  return res.data;
};

export const getPlayersByTeam = async (teamId: string): Promise<User[]> => {
  const res = await axios.get(`${API_BASE}/players/team/${teamId}`);
  return res.data;
};

export const getPlayersByTournament = async (
  tournamentId: string
): Promise<User[]> => {
  const res = await axios.get(
    `${API_BASE}/players/by-tournament/${tournamentId}`
  );
  return res.data;
};

export const createPlayer = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<User> => {
  const res = await axios.post(`${API_BASE}/users`, data);
  return res.data;
};

export const deletePlayer = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/users/${id}`);
};

export const deletePlayerFromTeam = async (
  teamId: string,
  playerId: string
): Promise<void> => {
  await axios.delete(`${API_BASE}/players/${playerId}/removeFromteam`);
};

export function usePlayers() {
  return useQuery<User[]>({
    queryKey: ["players"],
    queryFn: async () => {
      const users = await getPlayers();
      // Filtrar por rol Player
      return users.filter((u) => u.role === "Player");
    },
  });
}

export function usePlayersByTournament(tournamentId: string) {
  return useQuery<User[]>({
    queryKey: ["players", "tournament", tournamentId],
    queryFn: () => getPlayersByTournament(tournamentId),
    enabled: !!tournamentId,
  });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useDeletePlayerFromTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, playerId }: { teamId: string; playerId: string }) =>
      deletePlayerFromTeam(teamId, playerId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId, "players"] });
      queryClient.invalidateQueries({ queryKey: ["allPlayers"] });
    },
  });
}

export function useTransferPlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerId,
      teamId,
    }: {
      playerId: string;
      teamId: string;
    }) => {
      // PATCH al endpoint de jugadores para cambiar el teamId
      const res = await axios.patch(`${API_BASE}/players/${playerId}`, {
        teamId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export const getPlayerByUserId = async (userId: string) => {
  const res = await axios.get(`${API_BASE}/players/by-user/${userId}`);
  return res.data;
};

export function usePlayerByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ["player", "byUser", userId],
    queryFn: () => (userId ? getPlayerByUserId(userId) : undefined),
    enabled: !!userId,
  });
}

// Traer todos los Player (con _id y userId populado)
export const getAllPlayers = async () => {
  const res = await axios.get(`${API_BASE}/players`);
  return res.data;
};

export function useAllPlayers() {
  return useQuery({
    queryKey: ["allPlayers"],
    queryFn: getAllPlayers,
  });
}

// Traer un Player por su _id
export const getPlayerById = async (playerId: string) => {
  const res = await axios.get(`${API_BASE}/players/${playerId}`);
  return res.data;
};

export function usePlayerById(playerId: string | undefined) {
  return useQuery({
    queryKey: ["player", playerId],
    queryFn: () => (playerId ? getPlayerById(playerId) : undefined),
    enabled: !!playerId,
  });
}

export interface RegisterPlayerData {
  name: string;
  email: string;
  password: string;
  phone: string;
  teamId: string;
  profilePicture?: File;
}

export const useRegisterPlayer = () => {
  return useMutation({
    mutationFn: async (data: RegisterPlayerData) => {
      const response = await axios.post(`${API_BASE}/players`, {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        teamId: data.teamId,
      });
      return response.data;
    },
  });
};

export const createPlayerByUser = async ({
  userId,
  teamId,
}: {
  userId: string;
  teamId?: string;
}) => {
  const res = await axios.post(`${API_BASE}/players/by-user`, {
    userId,
    teamId,
  });
  return res.data;
};

export function useCreatePlayerByUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlayerByUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPlayers"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}
