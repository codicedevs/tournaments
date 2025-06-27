import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Team } from "../models/Team";

const API_BASE = "http://localhost:3000";

// Function to check if team name exists
export const checkTeamName = async (
  name: string
): Promise<{ exists: boolean }> => {
  if (!name || name.length < 3) return { exists: false };
  const res = await axios.get(
    `${API_BASE}/teams/check-name?name=${encodeURIComponent(name)}`
  );
  return res.data;
};

// Modified to handle file uploads
export const createTeam = async (data: any): Promise<Team> => {
  // Check if profileImage is a File object
  if (data.profileImage instanceof File) {
    // Create form data for the file
    const formData = new FormData();
    formData.append("file", data.profileImage);

    // Upload the file
    const uploadRes = await axios.post(`${API_BASE}/teams/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Replace the File object with the returned URL
    data = {
      ...data,
      profileImage: uploadRes.data.url,
    };
  }

  // Create the team with the processed data
  const res = await axios.post(`${API_BASE}/teams`, data);
  return res.data;
};

// Update a team
export const updateTeam = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<Team>;
}): Promise<Team> => {
  const res = await axios.patch(`${API_BASE}/teams/${id}`, data);
  return res.data;
};

// Delete a team
export const deleteTeam = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/teams/${id}`);
};

// Delete multiple teams
export const deleteTeams = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => deleteTeam(id)));
};

// Get a specific team
export const getTeam = async (id: string): Promise<Team> => {
  const res = await axios.get(`${API_BASE}/teams/${id}`);
  return res.data;
};
export const getTeams = async (): Promise<Team[]> => {
  const res = await axios.get(`${API_BASE}/teams`);
  return res.data;
};

export function useTeams() {
  return useQuery<Team[]>({ queryKey: ["teams"], queryFn: () => getTeams() });
}

export function useTeam(id: string) {
  return useQuery<Team>({
    queryKey: ["teams", id],
    queryFn: () => getTeam(id),
    enabled: !!id,
  });
}

export function useCheckTeamName(name: string) {
  return useQuery({
    queryKey: ["checkTeamName", name],
    queryFn: () => checkTeamName(name),
    enabled: !!name && name.length >= 3,
    staleTime: 10000,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTeam,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", data._id] });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export function useDeleteTeams() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeams,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

export const useTeamsByPhase = (phaseId: string) => {
  return useQuery({
    queryKey: ["teams", "phase", phaseId],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/teams/phase/${phaseId}`);
      return response.data;
    },
    enabled: !!phaseId,
  });
};

export const useResetTeamStats = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const response = await axios.post(
        `${API_BASE}/registrations/reset-stats/${tournamentId}`
      );
      return response.data;
    },
    onSuccess: (_, tournamentId) => {
      // Invalidar todas las consultas relacionadas
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({
        queryKey: ["registrations", "tournament", tournamentId],
      });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["matchdays"] });
      queryClient.invalidateQueries({ queryKey: ["phases"] });
    },
  });
};

export const getTeamPlayers = async (teamId: string) => {
  const res = await axios.get(`${API_BASE}/teams/${teamId}/players`);
  return res.data;
};

export function useTeamPlayers(teamId: string | undefined) {
  return useQuery({
    queryKey: ["teams", teamId, "players"],
    queryFn: () => (teamId ? getTeamPlayers(teamId) : []),
    enabled: !!teamId,
  });
}

// Añadir jugador a un equipo (creación y asociación en un solo paso)
export const addPlayerToTeam = async ({
  teamId,
  playerData,
}: {
  teamId: string;
  playerData: any;
}) => {
  const res = await axios.post(
    `${API_BASE}/teams/${teamId}/addPlayersToTeam`,
    playerData
  );
  return res.data;
};

export function useAddPlayerToTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addPlayerToTeam,
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId, "players"] });
    },
  });
}
