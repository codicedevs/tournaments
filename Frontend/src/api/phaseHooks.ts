import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Phase, PhaseType } from "../models/Phase";
import { API_BASE_URL } from "../config";
const API_BASE = API_BASE_URL;

export const getPhases = async (): Promise<Phase[]> => {
  const res = await axios.get(`${API_BASE}/phases`);
  return res.data;
};

export const getPhase = async (id: string): Promise<Phase> => {
  const res = await axios.get(`${API_BASE}/phases/${id}`);
  return res.data;
};

export const getPhasesByTournament = async (
  tournamentId: string
): Promise<Phase[]> => {
  const res = await axios.get(`${API_BASE}/phases/tournament/${tournamentId}`);
  return res.data;
};

export const createPhase = async (data: {
  name: string;
  type: PhaseType;
  tournamentId: string;
}): Promise<Phase> => {
  const res = await axios.post(`${API_BASE}/phases`, data);
  return res.data;
};

export const deletePhase = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/phases/${id}`);
};

export function usePhases() {
  return useQuery<Phase[]>({
    queryKey: ["phases"],
    queryFn: getPhases,
  });
}

export function usePhase(id: string | undefined) {
  return useQuery<Phase>({
    queryKey: ["phases", id],
    queryFn: () => (id ? getPhase(id) : Promise.reject("No phase ID provided")),
    enabled: !!id,
  });
}

export function usePhasesByTournament(tournamentId: string | undefined) {
  return useQuery<Phase[]>({
    queryKey: ["phases", "tournament", tournamentId],
    queryFn: () => (tournamentId ? getPhasesByTournament(tournamentId) : []),
    enabled: !!tournamentId,
  });
}

export function useCreatePhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPhase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({
        queryKey: ["phases", "tournament", data.tournamentId],
      });
    },
  });
}

export function useDeletePhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePhase,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({ queryKey: ["phases", "tournament"] });
    },
  });
}
