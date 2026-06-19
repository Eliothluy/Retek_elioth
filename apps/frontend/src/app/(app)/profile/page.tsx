"use client";

import { Award, Zap, CheckCircle2, Calendar } from "lucide-react";
import { Avatar, Card, CardContent, CardHeader, CardTitle, Skeleton, cn } from "@retekgpt/ui";
import { useAuthStore } from "@/stores/auth-store";
import { useTasks } from "@/hooks/use-tasks";
import { useRankingCategory } from "@/hooks/use-ranking";
import { useBadges, BADGE_META, ALL_BADGE_TYPES } from "@/hooks/use-badges";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: tasks = [] } = useTasks();
  const { data: ranking } = useRankingCategory("PERFORMANCE");
  const { data: earnedBadges = [] } = useBadges();
  const myTasks = tasks.filter((t) => t.assigneeId === user?.id);
  const completed = myTasks.filter((t) => t.status === "COMPLETED").length;
  const myRank = ranking?.find((r) => r.userId === user?.id);
  const earnedTypes = new Set(earnedBadges.map((b) => b.type));

  if (!user) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="overflow-hidden">
        <div className="h-24 gradient-brand" />
        <CardContent className="-mt-12 flex items-end gap-4 pb-6">
          <Avatar src={user.avatarUrl ?? undefined} fallback={user.name} size="lg" className="ring-4 ring-white dark:ring-slate-800" />
          <div className="pb-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.title ?? "Desenvolvedor"} · {user.email}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 text-center dark:bg-slate-800">
          <Zap className="mx-auto h-6 w-6 text-amber-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{user.points}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pontos</p>
        </Card>
        <Card className="p-5 text-center dark:bg-slate-800">
          <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{completed}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Concluídas</p>
        </Card>
        <Card className="p-5 text-center dark:bg-slate-800">
          <Award className="mx-auto h-6 w-6 text-brand-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">#{myRank?.rank ?? "—"}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ranking</p>
        </Card>
      </div>

      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">Badges 🏅</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ALL_BADGE_TYPES.map((type) => {
              const meta = BADGE_META[type]!;
              const earned = earnedTypes.has(type);
              return (
                <div
                  key={type}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border p-4 text-center transition-all",
                    earned
                      ? "border-amber-200 bg-amber-50/50 dark:border-amber-700/50 dark:bg-amber-900/20"
                      : "border-slate-200 bg-slate-50 opacity-60 dark:border-slate-700 dark:bg-slate-800"
                  )}
                  title={meta.description}
                >
                  <span className={cn("text-3xl", !earned && "grayscale")}>{meta.emoji}</span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{meta.title}</p>
                  <p className="text-[10px] text-slate-400">{earned ? "✓ Conquistada" : "Bloqueada"}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>{user.bio ?? "Sem bio definida."}</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="h-4 w-4" /> Membro desde {formatDate(user.createdAt)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
