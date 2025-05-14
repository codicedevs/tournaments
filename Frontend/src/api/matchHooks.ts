import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = "http://localhost:3000";

export const getMatches = async () => {
  const res = await axios.get(`${API_BASE}/matches`);
  return res.data;
};

export const createMatch = async (data: any) => {
  const res = await axios.post(`${API_BASE}/matches`, data);
  return res.data;
};

export function useMatches() {
  return useQuery({ queryKey: ["matches"], queryFn: getMatches });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
  return mutation;
}
