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

export function useTeams() {
  return useQuery<Team[]>({ queryKey: ["teams"], queryFn: getTeams });
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
