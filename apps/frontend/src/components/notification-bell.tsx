"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, cn } from "@retekgpt/ui";
import { useNotifications, useUnreadCount, useMarkRead, useMarkAllRead } from "@/hooks/use-notifications";
import { useAuthStore } from "@/stores/auth-store";
import { useFocusStore } from "@/stores/focus-store";
import { connectSocket } from "@/lib/socket";
import { timeAgo } from "@/lib/utils";
import type { Notification } from "@/types";

const TYPE_ICON: Record<string, string> = {
  TASK_ASSIGNED: "📋",
  DEADLINE_APPROACHING: "⏰",
  TASK_LATE: "⚠️",
  FEED_INTERACTION: "💬",
  RANK_UPDATE: "📈",
  SYSTEM: "🔔",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: notifications = [] } = useNotifications();
  const { data: unread } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const shouldSilence = useFocusStore((s) => s.shouldSilence);

  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = connectSocket();
    if (!socket) return;
    const handler = (payload: Notification) => {
      if (shouldSilence(payload.type)) return;
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      if (typeof window !== "undefined" && localStorage.getItem("retek-push-enabled") === "true") {
        import("@/lib/push").then(({ showLocalNotification }) => {
          showLocalNotification(payload.title, { body: payload.message, tag: payload.id });
        });
      }
    };
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [isAuthenticated, queryClient]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const count = unread?.count ?? 0;

  function handleClick(n: Notification) {
    if (!n.read) markRead.mutate([n.id]);
    if (n.link) window.location.href = n.link;
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-full text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white animate-pop">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 origin-top-right rounded-2xl border border-slate-200 bg-white shadow-card animate-slide-in dark:border-slate-700 dark:bg-slate-800 sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notificações</h3>
            {count > 0 && (
              <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
                <Check className="h-3.5 w-3.5" /> Marcar todas
              </Button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                Sem notificações ainda 🔔
              </p>
            ) : (
              notifications.slice(0, 12).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                    !n.read && "bg-brand-50/40"
                  )}
                >
                  <span className="text-xl">{TYPE_ICON[n.type] ?? "🔔"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{n.title}</p>
                    <p className="truncate text-xs text-slate-500">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                </button>
              ))
            )}
          </div>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-medium text-brand-600 hover:bg-slate-50"
          >
            Ver todas
          </Link>
        </div>
      )}
    </div>
  );
}
