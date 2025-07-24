import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Phase, Matchday, Match } from "../models";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

// Fetch all phases for a tournament
export const getTournamentPhases = async (
  tournamentId: string
): Promise<Phase[]> => {
  const res = await axios.get(`${API_BASE}/phases/tournament/${tournamentId}`);
  return res.data;
};

// Fetch all matchdays for a phase
export const getPhaseMatchdays = async (
  phaseId: string
): Promise<Matchday[]> => {
  const res = await axios.get(`${API_BASE}/matchdays/phase/${phaseId}`);
  return res.data;
};

// Fetch all matches for a matchday
export const getMatchdayMatches = async (
  matchdayId: string
): Promise<Match[]> => {
  const res = await axios.get(`${API_BASE}/matches/matchday/${matchdayId}`);
  return res.data;
};

// Generate fixtures for a phase
export const generateFixtures = async ({
  phaseId,
  isLocalAway,
  startDate,
  weekDay,
}: {
  phaseId: string;
  isLocalAway: boolean;
  startDate: string;
  weekDay: string;
}): Promise<{ matchDays: Matchday[]; matches: Match[] }> => {
  const res = await axios.post(
    `${API_BASE}/phases/${phaseId}/fixture?isLocalAway=${isLocalAway}&startDate=${encodeURIComponent(
      startDate
    )}&weekDay=${weekDay}`
  );
  return res.data;
};

// Create league structure (match days only)
export const createLeague = async ({
  phaseId,
  matchDaysAmount,
  isLocalAway,
  startDate,
  weekDay,
}: {
  phaseId: string;
  matchDaysAmount: number;
  isLocalAway: boolean;
  startDate: string;
  weekDay: string;
}): Promise<Matchday[]> => {
  const res = await axios.post(
    `${API_BASE}/phases/${phaseId}/league?matchDaysAmount=${matchDaysAmount}&isLocalAway=${isLocalAway}&startDate=${encodeURIComponent(
      startDate
    )}&weekDay=${weekDay}`
  );
  return res.data;
};

// Eliminar todas las jornadas de una fase
export const deleteMatchdaysByPhase = async (
  phaseId: string
): Promise<void> => {
  await axios.delete(`${API_BASE}/phases/${phaseId}/matchdays`);
};

// Custom hooks
export function useTournamentPhases(tournamentId: string | undefined) {
  return useQuery<Phase[]>({
    queryKey: ["phases", tournamentId],
    queryFn: () => (tournamentId ? getTournamentPhases(tournamentId) : []),
    enabled: !!tournamentId,
  });
}

export function usePhaseMatchdays(phaseId: string | undefined) {
  return useQuery<Matchday[]>({
    queryKey: ["matchdays", phaseId],
    queryFn: () => (phaseId ? getPhaseMatchdays(phaseId) : []),
    enabled: !!phaseId,
  });
}

export function useMatchdayMatches(matchdayId: string | undefined) {
  return useQuery<Match[]>({
    queryKey: ["matches", matchdayId],
    queryFn: () => (matchdayId ? getMatchdayMatches(matchdayId) : []),
    enabled: !!matchdayId,
  });
}

export function useGenerateFixtures() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateFixtures,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({
        queryKey: ["matchdays", variables.phaseId],
      });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useCreateLeague() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeague,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["matchdays", variables.phaseId],
      });
    },
  });
}

export function useDeleteMatchdaysByPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (phaseId: string) => deleteMatchdaysByPhase(phaseId),
    onSuccess: (_, phaseId) => {
      queryClient.invalidateQueries({ queryKey: ["matchdays", phaseId] });
    },
  });
}
