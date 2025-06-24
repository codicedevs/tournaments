import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Registration, PopulatedRegistration } from "../models/Registration";

const API_BASE = "http://localhost:3000";

// Get all registrations
export const getRegistrations = async (): Promise<Registration[]> => {
  const res = await axios.get(`${API_BASE}/registrations`);
  return res.data;
};

// Get registrations by tournament (with populated team data)
export const getRegistrationsByTournament = async (
  tournamentId: string
): Promise<PopulatedRegistration[]> => {
  const res = await axios.get(
    `${API_BASE}/registrations/tournament/${tournamentId}`
  );
  console.log("res.data", res.data);
  return res.data;
};

// Get registrations by team
export const getRegistrationsByTeam = async (
  teamId: string
): Promise<Registration[]> => {
  const res = await axios.get(`${API_BASE}/registrations/team/${teamId}`);
  return res.data;
};

// Create a registration
export const createRegistration = async (data: {
  teamId: string;
  tournamentId: string;
}): Promise<Registration> => {
  const res = await axios.post(`${API_BASE}/registrations`, data);
  return res.data;
};

// Delete a registration
export const deleteRegistration = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/registrations/${id}`);
};

// Custom hooks
export function useRegistrations() {
  return useQuery<Registration[]>({
    queryKey: ["registrations"],
    queryFn: getRegistrations,
  });
}

export function useRegistrationsByTournament(tournamentId: string | undefined) {
  return useQuery<PopulatedRegistration[]>({
    queryKey: ["registrations", "tournament", tournamentId],
    queryFn: () =>
      tournamentId ? getRegistrationsByTournament(tournamentId) : [],
    enabled: !!tournamentId,
  });
}

export function useRegistrationsByTeam(teamId: string | undefined) {
  return useQuery<Registration[]>({
    queryKey: ["registrations", "team", teamId],
    queryFn: () => (teamId ? getRegistrationsByTeam(teamId) : []),
    enabled: !!teamId,
  });
}

export function useCreateRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRegistration,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({
        queryKey: ["registrations", "tournament", data.tournamentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["registrations", "team", data.teamId],
      });
    },
  });
}

export function useDeleteRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });
}
