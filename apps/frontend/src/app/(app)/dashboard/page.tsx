"use client";

import Link from "next/link";
import { CheckCircle2, Clock, AlertTriangle, Zap, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton } from "@retekgpt/ui";
import { TaskCard } from "@/components/task-card";
import { FeedItem } from "@/components/feed-item";
import { useAuthStore } from "@/stores/auth-store";
import { useTasks } from "@/hooks/use-tasks";
import { useFeed } from "@/hooks/use-feed";
import { useRankingCategory } from "@/hooks/use-ranking";
import { RankingBoard } from "@/components/ranking-board";

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: feed = [] } = useFeed();
  const { data: performance } = useRankingCategory("PERFORMANCE");

  const myTasks = tasks.filter((t) => t.assigneeId === user?.id);
  const myActive = myTasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "PENDING");
  const myCompleted = myTasks.filter((t) => t.status === "COMPLETED");
  const myLate = myTasks.filter((t) => t.status === "LATE" || t.isLate);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500">Aqui está o resumo do seu dia.</p>
        </div>
        <Link href="/tasks">
          <Button variant="outline">
            Ver todas as tarefas <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Clock} label="Tarefas ativas" value={myActive.length} color="bg-brand-500" />
        <StatCard icon={CheckCircle2} label="Concluídas" value={myCompleted.length} color="bg-success-500" />
        <StatCard icon={AlertTriangle} label="Atrasadas" value={myLate.length} color="bg-rose-500" />
        <StatCard icon={Zap} label="Pontos" value={user?.points ?? 0} color="bg-amber-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Minhas tarefas</h2>
            <Link href="/tasks" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Ver tudo
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {tasksLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
              : myActive.slice(0, 4).map((t) => <TaskCard key={t.id} task={t} />)}
            {!tasksLoading && myActive.length === 0 && (
              <Card className="col-span-full p-8 text-center">
                <p className="text-slate-500">Tudo em dia! Nenhuma tarefa pendente 🎯</p>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">🏆 Top Performance</h2>
          {performance ? <RankingBoard entries={performance.slice(0, 5)} /> : <Skeleton className="h-48 rounded-2xl" />}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">📰 Atividade recente</h2>
          <Link href="/feed" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Ver feed completo
          </Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {feed.slice(0, 4).map((a) => <FeedItem key={a.id} activity={a} />)}
        </div>
      </div>
    </div>
  );
}
