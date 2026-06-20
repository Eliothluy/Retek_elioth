"use client";

import { CheckCheck } from "lucide-react";
import { Button, Card } from "@retekapp/ui";
import { useNotifications, useMarkAllRead, useMarkRead } from "@/hooks/use-notifications";
import { timeAgo } from "@/lib/utils";
import { cn } from "@retekapp/ui";

const TYPE_ICON: Record<string, string> = {
  TASK_ASSIGNED: "📋",
  DEADLINE_APPROACHING: "⏰",
  TASK_LATE: "⚠️",
  FEED_INTERACTION: "💬",
  RANK_UPDATE: "📈",
  SYSTEM: "🔔",
};

export default function NotificationsPage() {
  const { data: notifications = [] } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();
  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notificações</h1>
          <p className="text-sm text-slate-500">{unread.length} não lidas</p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-4xl">🔕</p>
          <p className="mt-2 font-medium text-slate-700">Tudo tranquilo por aqui</p>
          <p className="text-sm text-slate-500">Você não tem notificações.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (!n.read) markRead.mutate([n.id]);
                if (n.link) window.location.href = n.link;
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:shadow-soft",
                !n.read ? "border-brand-200 bg-brand-50/40" : "border-slate-200 bg-white"
              )}
            >
              <span className="text-2xl">{TYPE_ICON[n.type] ?? "🔔"}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  <span className="text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600">{n.message}</p>
              </div>
              {!n.read && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
