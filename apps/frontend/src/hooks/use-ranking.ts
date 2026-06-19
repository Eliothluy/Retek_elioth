import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RankingEntry } from "@/types";

export function useRankingAll() {
  return useQuery({
    queryKey: ["ranking", "all"],
    queryFn: () => api.ranking.all(),
    refetchInterval: 60000,
  });
}

export function useRankingCategory(category: string) {
  return useQuery({
    queryKey: ["ranking", category],
    queryFn: () => api.ranking.category(category),
    refetchInterval: 60000,
  });
}

export type { RankingEntry };
