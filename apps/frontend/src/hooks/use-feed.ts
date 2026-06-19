import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ActivityFeed } from "@/types";

export const feedKeys = {
  all: ["feed"] as const,
  list: (cursor?: string) => ["feed", "list", cursor] as const,
};

export function useFeed(cursor?: string) {
  return useQuery({
    queryKey: feedKeys.list(cursor),
    queryFn: () => api.feed.list(cursor),
    refetchInterval: 30000,
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) => api.feed.like(activityId),
    onMutate: async (activityId: string) => {
      await qc.cancelQueries({ queryKey: feedKeys.all });
      const previous = qc.getQueriesData<ActivityFeed[]>({ queryKey: feedKeys.all });
      qc.setQueriesData<ActivityFeed[]>({ queryKey: feedKeys.all }, (old) =>
        (old ?? []).map((a) =>
          a.id === activityId
            ? {
                ...a,
                _count: {
                  likes: (a._count?.likes ?? 0) + 1,
                  comments: a._count?.comments ?? 0,
                },
              }
            : a
        )
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) {
        ctx.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: feedKeys.all }),
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, content }: { activityId: string; content: string }) =>
      api.feed.comment(activityId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: feedKeys.all }),
  });
}
