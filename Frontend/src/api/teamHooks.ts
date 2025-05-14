import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = "http://localhost:3000";

export const getTeams = async () => {
  const res = await axios.get(`${API_BASE}/teams`);
  return res.data;
};

export const createTeam = async (data: any) => {
  const res = await axios.post(`${API_BASE}/teams`, data);
  return res.data;
};

export function useTeams() {
  return useQuery({ queryKey: ["teams"], queryFn: getTeams });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
  return mutation;
}
