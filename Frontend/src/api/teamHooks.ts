import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Team } from "../models";

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
