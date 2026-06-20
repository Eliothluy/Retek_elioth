"use client";

import { Trophy, Medal, Award } from "lucide-react";
import { Avatar, cn } from "@retekapp/ui";
import type { RankingEntry } from "@/types";
import { useAuthStore } from "@/stores/auth-store";

const podiumIcons = [
  { icon: Trophy, color: "text-amber-500", bg: "bg-amber-100" },
  { icon: Medal, color: "text-slate-500", bg: "bg-slate-200" },
  { icon: Award, color: "text-orange-600", bg: "bg-orange-100" },
];

export function RankingBoard({ entries }: { entries: RankingEntry[] }) {
  const { user } = useAuthStore();

  return (
    <div className="space-y-2">
      {entries.map((entry, idx) => {
        const podium = podiumIcons[idx];
        const isMe = entry.userId === user?.id;
        return (
          <div
            key={entry.userId}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-3 transition-all",
              isMe
                ? "border-brand-300 bg-brand-50/60 ring-2 ring-brand-100"
                : "border-slate-200 bg-white hover:shadow-soft"
            )}
          >
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold",
                podium ? `${podium.bg} ${podium.color}` : "bg-slate-100 text-slate-500"
              )}
            >
              {podium ? <podium.icon className="h-5 w-5" /> : entry.rank}
            </div>
            <Avatar src={entry.avatarUrl ?? undefined} fallback={entry.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">
                {entry.name} {isMe && <span className="text-xs font-normal text-brand-600">(você)</span>}
              </p>
              <p className="truncate text-xs text-slate-500">{entry.title}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">{entry.score}</p>
              <p className="text-[11px] text-slate-400">pts</p>
            </div>
          </div>
        );
      })}
      {entries.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">Nenhum dado de ranking ainda.</p>
      )}
    </div>
  );
}
