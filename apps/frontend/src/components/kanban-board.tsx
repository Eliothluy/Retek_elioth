"use client";

import { useState } from "react";
import {
  DndContext, type DragEndEvent, type DragStartEvent,
  PointerSensor, useSensor, useSensors,
  closestCorners, DragOverlay,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, List, Columns } from "lucide-react";
import { Button, Card, cn } from "@retekapp/ui";
import { TaskCard } from "@/components/task-card";
import { TaskForm } from "@/components/task-form";
import { Modal } from "@/components/ui/modal";
import { KanbanCard } from "@/components/kanban-card";
import { useTasks, useUpdateTaskStatus } from "@/hooks/use-tasks";
import { STATUS_LABELS } from "@/lib/constants";
import type { Task, TaskStatus } from "@/types";

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "PENDING", label: "Pendente", color: "border-t-slate-400" },
  { status: "IN_PROGRESS", label: "Em andamento", color: "border-t-brand-500" },
  { status: "LATE", label: "Atrasado", color: "border-t-rose-500" },
  { status: "COMPLETED", label: "Concluído", color: "border-t-emerald-500" },
];

export function KanbanBoard() {
  const { data: tasks = [] } = useTasks();
  const updateStatus = useUpdateTaskStatus();
  const [showCreate, setShowCreate] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(e: DragStartEvent) {
    const task = tasks.find((t) => t.id === e.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;
    const taskId = active.id as string;
    const targetStatus = over.id as TaskStatus;
    if (Object.values(["PENDING", "IN_PROGRESS", "COMPLETED", "LATE"]).includes(targetStatus)) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== targetStatus) {
        updateStatus.mutate({ id: taskId, status: targetStatus });
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {COLUMNS.map((col) => {
            const count = tasks.filter((t) => t.status === col.status).length;
            return (
              <span key={col.status} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                {col.label}: {count}
              </span>
            );
          })}
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Nova
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="flex flex-col">
                <div className={cn("rounded-t-xl border-t-4 bg-slate-50 px-3 py-2 dark:bg-slate-800/50", col.color)}>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {col.label} <span className="text-slate-400">({colTasks.length})</span>
                  </h3>
                </div>
                <SortableContext
                  id={col.status}
                  items={colTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    id={col.status}
                    className="flex min-h-[200px] flex-1 flex-col gap-2 rounded-b-xl border border-t-0 border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/50"
                  >
                    {colTasks.map((task) => (
                      <KanbanCard key={task.id} task={task} />
                    ))}
                    {colTasks.length === 0 && (
                      <p className="py-8 text-center text-xs text-slate-400">Arraste tarefas aqui</p>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="rotate-3 opacity-90">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nova tarefa">
        <TaskForm onDone={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
