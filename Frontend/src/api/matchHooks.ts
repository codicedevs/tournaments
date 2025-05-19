import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Match, MatchResult } from "../models";

const API_BASE = "http://localhost:3000";

export const getMatches = async (): Promise<Match[]> => {
  const res = await axios.get(`${API_BASE}/matches`);
  return res.data;
};

export const createMatch = async (data: {
  teamA: string;
  teamB: string;
  date: Date;
  result?: MatchResult;
  matchDayId?: string;
}): Promise<Match> => {
  const res = await axios.post(`${API_BASE}/matches`, data);
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

export function useMatchesByMatchday(matchdayId: string | undefined) {
  return useQuery<Match[]>({
    queryKey: ["matches", "matchday", matchdayId],
    queryFn: () => (matchdayId ? getMatchesByMatchday(matchdayId) : []),
    enabled: !!matchdayId,
  });
}
