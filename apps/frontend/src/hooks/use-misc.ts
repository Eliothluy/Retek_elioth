import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Project, User } from "@/types";

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: () => api.projects.list() });
}

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: () => api.users.list() });
}

export type { Project, User };
