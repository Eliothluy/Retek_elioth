"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, Calendar } from "lucide-react";
import { Avatar, Badge, cn } from "@retekapp/ui";
import type { Task } from "@/types";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PomodoroModal } from "./pomodoro-modal";

const badgeVariant = (color?: string) =>
  color === "success" ? "success" : color === "danger" ? "danger" : color === "warning" ? "warning" : "neutral";

export function TaskCard({ task, onStatusChange }: { task: Task; onStatusChange?: (status: Task["status"]) => void }) {
  const isLate = task.isLate || task.status === "LATE";
  const isDone = task.status === "COMPLETED";
  const [pomodoroOpen, setPomodoroOpen] = useState(false);

  function handleStart() {
    onStatusChange?.("IN_PROGRESS");
    setPomodoroOpen(true);
  }

  return (
    <>
      <div
        className={cn(
          "group rounded-2xl border bg-white p-4 shadow-soft transition-all hover:shadow-card hover:-translate-y-0.5",
          isLate ? "border-rose-200" : "border-slate-200"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {task.project && (
                <span
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${task.project.color}1a`, color: task.project.color }}
                >
                  {task.project.name}
                </span>
              )}
              {task.module && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{task.module}</span>
              )}
            </div>
            <Link href={`/tasks/${task.id}`} className="block">
              <h3 className="truncate font-semibold text-slate-900 group-hover:text-brand-600">{task.title}</h3>
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant={badgeVariant(STATUS_COLORS[task.status])}>{STATUS_LABELS[task.status]}</Badge>
            <Badge variant={badgeVariant(PRIORITY_COLORS[task.priority])}>{PRIORITY_LABELS[task.priority]}</Badge>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDate(task.endDate)}
            </span>
            {isLate && !isDone && (
              <span className="flex items-center gap-1 font-medium text-rose-600">
                <AlertTriangle className="h-3.5 w-3.5" /> Atrasada
              </span>
            )}
            {task.alert && (
              <span className="flex items-center gap-1 text-amber-600">
                <Clock className="h-3.5 w-3.5" /> Alerta
              </span>
            )}
          </div>

          {task.assignee && (
            <div className="flex items-center gap-1.5">
              <Avatar src={task.assignee.avatarUrl ?? undefined} fallback={task.assignee.name} size="sm" />
              <span className="hidden text-xs text-slate-600 sm:block">{task.assignee.name}</span>
            </div>
          )}
        </div>

        {onStatusChange && !isDone && (
          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
            {task.status === "PENDING" && (
              <button
                onClick={handleStart}
                className="flex-1 rounded-lg bg-brand-50 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
              >
                ▶ Iniciar com Pomodoro 🍅
              </button>
            )}
            {task.status === "IN_PROGRESS" && (
              <button
                onClick={() => setPomodoroOpen(true)}
                className="flex-1 rounded-lg bg-brand-50 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
              >
                🍅 Retomar Pomodoro
              </button>
            )}
            <button
              onClick={() => onStatusChange("COMPLETED")}
              className="flex-1 rounded-lg bg-emerald-50 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              ✓ Concluir
            </button>
          </div>
        )}
      </div>

      <PomodoroModal
        open={pomodoroOpen}
        onClose={() => setPomodoroOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
        onComplete={() => onStatusChange?.("COMPLETED")}
      />
    </>
  );
}
