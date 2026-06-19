"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge, cn } from "@retekgpt/ui";
import { useTasks } from "@/hooks/use-tasks";
import { useUpdateTaskStatus } from "@/hooks/use-tasks";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays,
  isSameMonth, isSameDay, addMonths, subMonths,
} from "date-fns";

const badgeVariant = (color?: string) =>
  color === "success" ? "success" : color === "danger" ? "danger" : color === "warning" ? "warning" : "neutral";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: tasks = [] } = useTasks();

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [currentDate]);

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      const key = new Date(t.endDate).toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const selectedTasks = selectedDate
    ? tasksByDay[selectedDate.toISOString().slice(0, 10)] ?? []
    : [];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
          <CalIcon className="h-6 w-6 text-brand-500" /> Calendário
        </h1>
        <p className="text-sm text-slate-500">Visualize tarefas por data de vencimento.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 dark:bg-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="dark:text-slate-100">
                {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </CardTitle>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="rounded-lg px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Hoje
                </button>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((d) => (
                <div key={d} className="pb-2 text-center text-xs font-semibold text-slate-400">
                  {d}
                </div>
              ))}
              {calendarDays.map((day) => {
                const key = day.toISOString().slice(0, 10);
                const dayTasks = tasksByDay[key] ?? [];
                const inMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isOverloaded = dayTasks.length >= 3;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "flex min-h-[72px] flex-col items-start rounded-lg border p-1.5 text-left transition-all",
                      inMonth ? "bg-white dark:bg-slate-700" : "bg-slate-50 dark:bg-slate-800/50",
                      isSelected ? "border-brand-400 ring-2 ring-brand-100" : "border-slate-100 dark:border-slate-600",
                      isToday && "ring-1 ring-brand-300",
                      isOverloaded && inMonth && "border-amber-200 bg-amber-50/40 dark:border-amber-700/50 dark:bg-amber-900/10"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium",
                      isToday ? "grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-white" : "text-slate-600 dark:text-slate-300",
                      !inMonth && "text-slate-300 dark:text-slate-600"
                    )}>
                      {day.getDate()}
                    </span>
                    <div className="mt-1 flex w-full flex-wrap gap-0.5">
                      {dayTasks.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className={cn(
                            "h-1.5 w-full rounded-full",
                            t.status === "COMPLETED" ? "bg-emerald-400" : t.status === "LATE" || t.isLate ? "bg-rose-400" : "bg-brand-400"
                          )}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{dayTasks.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">
              {selectedDate ? formatDate(selectedDate) : "Selecione um dia"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                {selectedDate ? "Nenhuma tarefa com vencimento neste dia ✨" : "Clique em um dia para ver as tarefas"}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedTasks.map((t) => (
                  <div key={t.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-600">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.title}</p>
                      <Badge variant={badgeVariant(STATUS_COLORS[t.status])}>{STATUS_LABELS[t.status]}</Badge>
                    </div>
                    {t.assignee && <p className="mt-1 text-xs text-slate-400">{t.assignee.name}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
