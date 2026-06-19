"use client";

import { useState } from "react";
import { Plus, ListFilter, List, Columns } from "lucide-react";
import { Button, Card, cn } from "@retekgpt/ui";
import { TaskCard } from "@/components/task-card";
import { TaskForm } from "@/components/task-form";
import { Modal } from "@/components/ui/modal";
import { KanbanBoard } from "@/components/kanban-board";
import { useTasks, useUpdateTaskStatus } from "@/hooks/use-tasks";
import type { Task, TaskStatus } from "@/types";

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
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const { data: tasks = [], isLoading } = useTasks(filter ? { status: filter } : undefined);
  const updateStatus = useUpdateTaskStatus();

  function handleStatusChange(taskId: string, status: TaskStatus) {
    updateStatus.mutate({ id: taskId, status });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tarefas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie e acompanhe todas as tarefas da equipe.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                viewMode === "list" ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <List className="h-4 w-4" /> Lista
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                viewMode === "kanban" ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Columns className="h-4 w-4" /> Kanban
            </button>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Nova tarefa
          </Button>
        </div>
      </div>

      {viewMode === "list" && (
        <div className="flex flex-wrap items-center gap-2">
          <ListFilter className="h-4 w-4 text-slate-400" />
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                filter === f.value
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {viewMode === "kanban" ? (
        <KanbanBoard />
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-700" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="p-12 text-center dark:bg-slate-800">
          <p className="text-4xl">📭</p>
          <p className="mt-2 font-medium text-slate-700 dark:text-slate-300">Nenhuma tarefa encontrada</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Crie uma nova tarefa para começar.</p>
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
