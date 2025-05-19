import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Phase, Matchday, Match } from "../models";

const API_BASE = "http://localhost:3000";

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
}: {
  phaseId: string;
  isLocalAway: boolean;
}): Promise<{ matchDays: Matchday[]; matches: Match[] }> => {
  const res = await axios.post(
    `${API_BASE}/phases/${phaseId}/fixture?isLocalAway=${isLocalAway}`
  );
  return res.data;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      queryClient.invalidateQueries({ queryKey: ["matchdays"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
