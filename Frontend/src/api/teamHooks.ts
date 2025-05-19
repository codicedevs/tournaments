import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Team } from "../models";

const API_BASE = "http://localhost:3000";

export const getTeams = async (): Promise<Team[]> => {
  const res = await axios.get(`${API_BASE}/teams`);
  return res.data;
};

export const createTeam = async (data: Partial<Team>): Promise<Team> => {
  const res = await axios.post(`${API_BASE}/teams`, data);
  return res.data;
};

// Update a team
export const updateTeam = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Team>;
}): Promise<Team> => {
  const res = await axios.patch(`${API_BASE}/teams/${id}`, data);
  return res.data;
};

// Delete a team
export const deleteTeam = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/teams/${id}`);
};

// Delete multiple teams
export const deleteTeams = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => deleteTeam(id)));
};

// Get a specific team
export const getTeam = async (id: string): Promise<Team> => {
  const res = await axios.get(`${API_BASE}/teams/${id}`);
  return res.data;
};

export function useTeams() {
  return useQuery<Team[]>({ queryKey: ["teams"], queryFn: getTeams });
}

export function useTeam(id: string) {
  return useQuery<Team>({
    queryKey: ["teams", id],
    queryFn: () => getTeam(id),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTeam,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", data._id] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useDeleteTeams() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeams,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
