import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Tournament } from "../models";

const API_BASE = "http://localhost:3000";

// Get all tournaments
export const getTournaments = async (): Promise<Tournament[]> => {
  const res = await axios.get(`${API_BASE}/tournaments`);
  return res.data;
};

// Get a specific tournament
export const getTournament = async (id: string): Promise<Tournament> => {
  const res = await axios.get(`${API_BASE}/tournaments/${id}`);
  return res.data;
};

// Create a tournament
export const createTournament = async (data: {
  name: string;
}): Promise<Tournament> => {
  const res = await axios.post(`${API_BASE}/tournaments`, data);
  return res.data;
};

// Update a tournament
export const updateTournament = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Tournament>;
}): Promise<Tournament> => {
  const res = await axios.patch(`${API_BASE}/tournaments/${id}`, data);
  return res.data;
};

// Delete a tournament
export const deleteTournament = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/tournaments/${id}`);
};

// Custom hooks
export function useTournaments() {
  return useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: getTournaments,
  });
}

export function useTournament(id: string) {
  return useQuery<Tournament>({
    queryKey: ["tournaments", id],
    queryFn: () => getTournament(id),
    enabled: !!id,
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useUpdateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTournament,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournaments", data._id] });
    },
  });
}

export function useDeleteTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}
