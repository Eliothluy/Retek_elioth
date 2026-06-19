"use client";

import { Award, Zap, CheckCircle2, Calendar } from "lucide-react";
import { Avatar, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@retekgpt/ui";
import { useAuthStore } from "@/stores/auth-store";
import { useTasks } from "@/hooks/use-tasks";
import { useRankingCategory } from "@/hooks/use-ranking";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: tasks = [] } = useTasks();
  const { data: ranking } = useRankingCategory("PERFORMANCE");
  const myTasks = tasks.filter((t) => t.assigneeId === user?.id);
  const completed = myTasks.filter((t) => t.status === "COMPLETED").length;
  const myRank = ranking?.find((r) => r.userId === user?.id);

  if (!user) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="overflow-hidden">
        <div className="h-24 gradient-brand" />
        <CardContent className="-mt-12 flex items-end gap-4 pb-6">
          <Avatar src={user.avatarUrl ?? undefined} fallback={user.name} size="lg" className="ring-4 ring-white" />
          <div className="pb-1">
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-sm text-slate-500">{user.title ?? "Desenvolvedor"} · {user.email}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <Zap className="mx-auto h-6 w-6 text-amber-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{user.points}</p>
          <p className="text-xs text-slate-500">Pontos</p>
        </Card>
        <Card className="p-5 text-center">
          <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{completed}</p>
          <p className="text-xs text-slate-500">Concluídas</p>
        </Card>
        <Card className="p-5 text-center">
          <Award className="mx-auto h-6 w-6 text-brand-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900">#{myRank?.rank ?? "—"}</p>
          <p className="text-xs text-slate-500">Ranking</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badges 🏅</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(user.badges ?? []).length > 0 ? (
              (user.badges as string[]).map((b) => (
                <span key={b} className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                  {b}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">Conclua tarefas para ganhar badges!</p>
            )}
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
