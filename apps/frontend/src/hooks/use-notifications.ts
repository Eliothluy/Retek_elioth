import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Notification } from "@/types";

export const notifKeys = {
  all: ["notifications"] as const,
  list: () => ["notifications", "list"] as const,
  unread: () => ["notifications", "unread"] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notifKeys.list(),
    queryFn: () => api.notifications.list(),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notifKeys.unread(),
    queryFn: () => api.notifications.unreadCount(),
    refetchInterval: 20000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api.notifications.markRead(ids),
    onSuccess: (_d, ids) => {
      qc.setQueryData<Notification[]>(notifKeys.list(), (old) =>
        (old ?? []).map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
      );
      qc.invalidateQueries({ queryKey: notifKeys.unread() });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => {
      qc.setQueryData<Notification[]>(notifKeys.list(), (old) =>
        (old ?? []).map((n) => ({ ...n, read: true }))
      );
      qc.invalidateQueries({ queryKey: notifKeys.unread() });
    },
  });
}
