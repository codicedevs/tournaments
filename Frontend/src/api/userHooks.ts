import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { User } from "../models/User";

export function useUser(userId: string) {
  return useQuery<User, Error>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Partial<User> & { _id: string }) => {
      const { data } = await api.patch(`/users/${user._id}`, user);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables._id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get("/users");
      return data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: any) => {
      const { data } = await api.post("/users", user, {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Eliminar un usuario por ID
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

// Eliminar varios usuarios por sus IDs
export const deleteUsers = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => deleteUser(id)));
};

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUsers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
