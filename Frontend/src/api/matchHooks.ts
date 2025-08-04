import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Match, MatchResult } from "../models";
import type { MatchEvent } from "../models/Match";
import { MatchStatus } from "../models/Match";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

export const getMatches = async (
  filter: Record<string, string>
): Promise<Match[]> => {
  const res = await axios.get(`${API_BASE}/matches`, { params: filter });
  return res.data;
};

export const createMatch = async (data: {
  teamA: string;
  teamB: string;
  date: string;
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
    status?: MatchStatus;
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

export function useMatches(filter: Record<string, string> = {}) {
  return useQuery<Match[]>({
    queryKey: ["matches", filter],
    queryFn: ({ queryKey }) =>
      getMatches(queryKey[1] as Record<string, string>),
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

export interface MatchUpdateData {
  matchId: string;
  event?: MatchEvent;
  viewerId?: string;
  refereeId?: string;
  fieldNumber?: string;
  date?: string;
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MatchUpdateData) => {
      const { matchId, event, viewerId, refereeId, fieldNumber, date } = data;
      console.log("dateee", date);
      if (event) {
        const playerId = event.playerId || "6851bd6c2001ffcdaa4d462e";
        const response = await axios.post(
          `${API_BASE}/matches/${matchId}/events`,
          {
            ...event,
            playerId,
          }
        );
        return response.data;
      } else {
        // PATCH para actualizar campos generales
        const patchData: any = {};
        if (viewerId !== undefined) patchData.viewerId = viewerId;
        if (refereeId !== undefined) patchData.refereeId = refereeId;
        if (fieldNumber !== undefined) patchData.fieldNumber = fieldNumber;
        if (date !== undefined) patchData.date = date;
        const response = await axios.patch(
          `${API_BASE}/matches/${matchId}`,
          patchData
        );
        return response.data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({
        queryKey: ["registrations", "tournament"],
      });
      queryClient.invalidateQueries({ queryKey: ["players"] });
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

export function useCompleteMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId }: { matchId: string }) => {
      const response = await axios.post(
        `${API_BASE}/matches/${matchId}/complete`
      );
      return response.data;
    },
  });
}

export const getMatchById = async (matchId: string): Promise<Match> => {
  const res = await axios.get(`${API_BASE}/matches/${matchId}`);
  return res.data;
};

export const getMatchTournamentDetails = async (
  matchId: string
): Promise<any> => {
  const res = await axios.get(
    `${API_BASE}/matches/${matchId}/tournament-details`
  );

  return res.data;
};

export function useMatchById(matchId: string | undefined) {
  return useQuery<Match>({
    queryKey: ["match", matchId],
    queryFn: () => {
      if (!matchId) throw new Error("No matchId");
      return getMatchById(matchId);
    },
    enabled: !!matchId,
  });
}

export function useMatchTournamentDetails(matchId: string | undefined) {
  return useQuery({
    queryKey: ["matchTournamentDetails", matchId],
    queryFn: () => {
      if (!matchId) throw new Error("No matchId");
      return getMatchTournamentDetails(matchId);
    },
    enabled: !!matchId,
  });
}

export function useUpdatePlayerMatches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      playerMatches,
    }: {
      matchId: string;
      playerMatches: any[];
    }) => {
      const response = await axios.patch(
        `${API_BASE}/matches/${matchId}/player-matches`,
        { playerMatches }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match"] });
    },
  });
}

// --- MatchObservations API ---

export interface MatchObservations {
  _id?: string;
  matchId: string;
  complaints: string;
  refereeEvaluation: string;
  redCardReport: string;
}

export const getMatchObservations = async (
  matchId: string
): Promise<MatchObservations | null> => {
  const res = await axios.get(`${API_BASE}/matches/${matchId}/observations`);
  return res.data;
};

export const updateMatchObservations = async (
  matchId: string,
  data: Partial<MatchObservations>
): Promise<MatchObservations> => {
  const res = await axios.patch(
    `${API_BASE}/matches/${matchId}/observations`,
    data
  );
  return res.data;
};

export function useMatchObservations(matchId: string | undefined) {
  return useQuery<MatchObservations | null>({
    queryKey: ["matchObservations", matchId],
    queryFn: () => (matchId ? getMatchObservations(matchId) : null),
    enabled: !!matchId,
  });
}

export function useUpdateMatchObservations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      data,
    }: {
      matchId: string;
      data: Partial<MatchObservations>;
    }) => {
      return updateMatchObservations(matchId, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["matchObservations", variables.matchId],
      });
    },
  });
}

// --- Event Management Hooks ---

export interface UpdateEventData {
  type?: string;
  minute?: number;
  team?: "TeamA" | "TeamB";
  playerId?: string;
}

export const updateMatchEvent = async (
  matchId: string,
  eventIndex: number,
  data: UpdateEventData
): Promise<Match> => {
  const res = await axios.patch(
    `${API_BASE}/matches/${matchId}/events/${eventIndex}`,
    data
  );
  return res.data;
};

export const deleteMatchEvent = async (
  matchId: string,
  eventIndex: number
): Promise<Match> => {
  const res = await axios.delete(
    `${API_BASE}/matches/${matchId}/events/${eventIndex}`
  );
  return res.data;
};

export function useUpdateMatchEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      eventIndex,
      data,
    }: {
      matchId: string;
      eventIndex: number;
      data: UpdateEventData;
    }) => {
      return updateMatchEvent(matchId, eventIndex, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({
        queryKey: ["registrations", "tournament"],
      });
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useDeleteMatchEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      matchId,
      eventIndex,
    }: {
      matchId: string;
      eventIndex: number;
    }) => {
      return deleteMatchEvent(matchId, eventIndex);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({
        queryKey: ["registrations", "tournament"],
      });
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}
