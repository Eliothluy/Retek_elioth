import { useQuery } from "@tanstack/react-query";

export interface DashboardStats {
  tasksByStatus: { name: string; value: number }[];
  tasksByDay: { date: string; count: number }[];
  pointsByDay: { date: string; points: number }[];
  completionTrend: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    late: number;
    completionRate: number;
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => apiFetch<DashboardStats>("/stats/dashboard"),
    refetchInterval: 60000,
  });
}

async function apiFetch<T>(path: string): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("retek_access_token") : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
