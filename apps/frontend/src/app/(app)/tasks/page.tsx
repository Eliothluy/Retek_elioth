"use client";

import { useState } from "react";
import { Plus, ListFilter } from "lucide-react";
import { Button, Card } from "@retekgpt/ui";
import { TaskCard } from "@/components/task-card";
import { TaskForm } from "@/components/task-form";
import { Modal } from "@/components/ui/modal";
import { useTasks, useUpdateTaskStatus } from "@/hooks/use-tasks";
import type { Task, TaskStatus } from "@/types";
import { STATUS_LABELS } from "@/lib/constants";

const FILTERS: { label: string; value?: TaskStatus }[] = [
  { label: "Todas" },
  { label: "Pendentes", value: "PENDING" },
  { label: "Em andamento", value: "IN_PROGRESS" },
  { label: "Concluídas", value: "COMPLETED" },
  { label: "Atrasadas", value: "LATE" },
];

export default function TasksPage() {
  const [filter, setFilter] = useState<TaskStatus | undefined>(undefined);
  const [showCreate, setShowCreate] = useState(false);
  const { data: tasks = [], isLoading } = useTasks(filter ? { status: filter } : undefined);
  const updateStatus = useUpdateTaskStatus();

  function handleStatusChange(taskId: string, status: TaskStatus) {
    updateStatus.mutate({ id: taskId, status });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tarefas</h1>
          <p className="text-sm text-slate-500">Gerencie e acompanhe todas as tarefas da equipe.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Nova tarefa
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ListFilter className="h-4 w-4 text-slate-400" />
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
              filter === f.value
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200/70" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-2 font-medium text-slate-700">Nenhuma tarefa encontrada</p>
          <p className="text-sm text-slate-500">Crie uma nova tarefa para começar.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={(status) => handleStatusChange(task.id, status)}
            />
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova tarefa" description="Crie uma tarefa e atribua a um membro da equipe.">
        <TaskForm onDone={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
