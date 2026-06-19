import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Badge {
  id: string;
  type: string;
  earnedAt: string;
}

export const BADGE_META: Record<string, { emoji: string; title: string; description: string }> = {
  FIRST_TASK: { emoji: "🚀", title: "Primeira Tarefa", description: "Concluiu sua primeira tarefa" },
  STREAK_7: { emoji: "🔥", title: "Sequência de 7 Dias", description: "Concluiu tarefas 7 dias seguidos" },
  POMODORO_MASTER: { emoji: "🍅", title: "Pomodoro Master", description: "Completou 10 sessões Pomodoro" },
  TOP_3: { emoji: "🏆", title: "Top 3", description: "Entrou no pódio do ranking" },
  CENTURY: { emoji: "💯", title: "Centenário", description: "Concluiu 100 tarefas" },
};

export const ALL_BADGE_TYPES = Object.keys(BADGE_META);

export function useBadges() {
  return useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const data = await apiFetch<Badge[]>("/badges");
      return data;
    },
  });
}

async function apiFetch<T>(path: string): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("retek_access_token") : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error("Failed to fetch badges");
  return res.json();
}
