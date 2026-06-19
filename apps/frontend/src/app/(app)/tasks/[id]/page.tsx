"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Play, Check, AlertTriangle, Timer } from "lucide-react";
import { Avatar, Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@retekgpt/ui";
import { Modal } from "@/components/ui/modal";
import { TaskForm } from "@/components/task-form";
import { PomodoroModal } from "@/components/pomodoro-modal";
import { useTask, useUpdateTaskStatus, useDeleteTask } from "@/hooks/use-tasks";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

const badgeVariant = (color?: string) =>
  color === "success" ? "success" : color === "danger" ? "danger" : color === "warning" ? "warning" : "neutral";

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: task, isLoading } = useTask(params.id);
  const updateStatus = useUpdateTaskStatus();
  const remove = useDeleteTask();
  const [editing, setEditing] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;
  if (!task)
    return (
      <Card className="p-12 text-center">
        <p className="text-slate-500">Tarefa não encontrada.</p>
        <Button variant="ghost" onClick={() => router.push("/tasks")}>← Voltar</Button>
      </Card>
    );

  const isDone = task.status === "COMPLETED";
  const isLate = task.isLate || task.status === "LATE";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => router.push("/tasks")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Voltar para tarefas
      </button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap gap-2">
                <Badge variant={badgeVariant(STATUS_COLORS[task.status])}>{STATUS_LABELS[task.status]}</Badge>
                <Badge variant={badgeVariant(PRIORITY_COLORS[task.priority])}>Prioridade {PRIORITY_LABELS[task.priority]}</Badge>
                {isLate && !isDone && <Badge variant="danger"><AlertTriangle className="h-3 w-3" /> Atrasada</Badge>}
                {task.alert && <Badge variant="warning">⏰ Alerta</Badge>}
              </div>
              <CardTitle className="text-xl">{task.title}</CardTitle>
              {task.project && <p className="text-sm text-slate-500">📁 {task.project.name}</p>}
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await remove.mutateAsync(task.id);
                  router.push("/tasks");
                }}
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {task.description && <p className="text-slate-700">{task.description}</p>}

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">Início</p>
              <p className="font-medium text-slate-700">{formatDateTime(task.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Fim</p>
              <p className="font-medium text-slate-700">{formatDateTime(task.endDate)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Conclusão</p>
              <p className="font-medium text-slate-700">{task.completedAt ? formatDateTime(task.completedAt) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Módulo</p>
              <p className="font-medium text-slate-700">{task.module ?? "—"}</p>
            </div>
          </div>

          {(task.pomodoroSessions > 0 || task.timeSpentMinutes > 0) && (
            <div className="flex items-center gap-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
              <span className="text-2xl">🍅</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">
                  {task.pomodoroSessions} sessão{task.pomodoroSessions !== 1 ? "ões" : ""} Pomodoro
                </p>
                <p className="text-xs text-slate-500">
                  {Math.floor(task.timeSpentMinutes / 60)}h {task.timeSpentMinutes % 60}min de tempo de foco
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              {task.assignee ? (
                <>
                  <Avatar src={task.assignee.avatarUrl ?? undefined} fallback={task.assignee.name} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{task.assignee.name}</p>
                    <p className="text-xs text-slate-500">{task.assignee.title ?? "Responsável"}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Sem responsável</p>
              )}
            </div>
            <span className="text-xs text-slate-400">Criado por {task.createdBy?.name}</span>
          </div>

          {!isDone && (
            <div className="flex gap-2">
              {task.status === "PENDING" && (
                <Button variant="secondary" onClick={() => { updateStatus.mutate({ id: task.id, status: "IN_PROGRESS" }); setPomodoroOpen(true); }}>
                  <Play className="h-4 w-4" /> Iniciar com Pomodoro 🍅
                </Button>
              )}
              {task.status === "IN_PROGRESS" && (
                <Button variant="secondary" onClick={() => setPomodoroOpen(true)}>
                  <Timer className="h-4 w-4" /> Retomar Pomodoro 🍅
                </Button>
              )}
              <Button variant="success" onClick={() => updateStatus.mutate({ id: task.id, status: "COMPLETED" })}>
                <Check className="h-4 w-4" /> Concluir tarefa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar tarefa">
        <TaskForm task={task} onDone={() => setEditing(false)} />
      </Modal>

      <PomodoroModal
        open={pomodoroOpen}
        onClose={() => setPomodoroOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
        onComplete={() => updateStatus.mutate({ id: task.id, status: "COMPLETED" })}
      />
    </div>
  );
}
