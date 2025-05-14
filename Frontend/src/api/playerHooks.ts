import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = "http://localhost:3000";

export const getPlayers = async () => {
  const res = await axios.get(`${API_BASE}/users`);
  return res.data;
};

export const createPlayer = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  const res = await axios.post(`${API_BASE}/users`, data);
  return res.data;
};

export const deletePlayer = async (id: string) => {
  await axios.delete(`${API_BASE}/users/${id}`);
};

export function usePlayers() {
  return useQuery({ queryKey: ["players"], queryFn: getPlayers });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
  return mutation;
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
  return mutation;
}
