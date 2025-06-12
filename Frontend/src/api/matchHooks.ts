import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Match, MatchResult } from "../models";

const API_BASE = "http://localhost:3000";

interface MatchEvent {
  type: "goal";
  minute: number;
  team: "TeamA" | "TeamB";
}

export const getMatches = async (): Promise<Match[]> => {
  const res = await axios.get(`${API_BASE}/matches`);
  return res.data;
};

export const createMatch = async (data: {
  teamA: string;
  teamB: string;
  date: Date;
  homeScore?: number;
  awayScore?: number;
  result?: MatchResult;
  matchDayId?: string;
}): Promise<Match> => {
  const res = await axios.post(`${API_BASE}/matches`, data);
  return res.data;
};

export const updateMatch = async (
  matchId: string,
  data: {
    homeScore?: number;
    awayScore?: number;
    result?: MatchResult;
    completed?: boolean;
  }
): Promise<Match> => {
  const res = await axios.patch(`${API_BASE}/matches/${matchId}`, data);
  return res.data;
};

export const getMatchesByMatchday = async (
  matchdayId: string
): Promise<Match[]> => {
  const res = await axios.get(`${API_BASE}/matches/matchday/${matchdayId}`);
  return res.data;
};

export function useMatches() {
  return useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: getMatches,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      event,
    }: {
      matchId: string;
      event: MatchEvent;
    }) => {
      const response = await axios.post(
        `${API_BASE}/matches/${matchId}/events`,
        event
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      // Invalidar las consultas de registros del torneo
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({
        queryKey: ["registrations", "tournament"],
      });
    },
  });
}

export function useMatchesByMatchday(matchdayId: string | undefined) {
  return useQuery<Match[]>({
    queryKey: ["matches", "matchday", matchdayId],
    queryFn: () => (matchdayId ? getMatchesByMatchday(matchdayId) : []),
    enabled: !!matchdayId,
  });
}
