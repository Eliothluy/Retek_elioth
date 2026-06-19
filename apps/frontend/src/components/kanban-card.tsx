"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@retekgpt/ui";
import { Badge } from "@retekgpt/ui";
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";

const badgeVariant = (color?: string) =>
  color === "success" ? "success" : color === "danger" ? "danger" : color === "warning" ? "warning" : "neutral";

export function KanbanCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing dark:border-slate-600 dark:bg-slate-700",
        isDragging && "shadow-lg"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-1.5">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{task.title}</p>
        <Badge variant={badgeVariant(PRIORITY_COLORS[task.priority])} className="shrink-0">
          {PRIORITY_LABELS[task.priority]}
        </Badge>
      </div>
      {task.project && (
        <span className="mb-1.5 inline-block text-xs text-slate-400">📁 {task.project.name}</span>
      )}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{formatDate(task.endDate)}</span>
        {task.assignee && (
          <span className="truncate text-slate-500">{task.assignee.name.split(" ")[0]}</span>
        )}
      </div>
    </div>
  );
}
