"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, FileSpreadsheet, Download } from "lucide-react";
import { Button, cn } from "@retekapp/ui";
import { useTasks } from "@/hooks/use-tasks";
import { useAuthStore } from "@/stores/auth-store";
import { exportReportPDF, exportReportCSV } from "@/lib/export";

export function ReportButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: tasks = [] } = useTasks();
  const { user } = useAuthStore();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const myTasks = tasks.filter((t) => t.assigneeId === user?.id);

  const reportData = {
    userName: user?.name ?? "Usuário",
    period: new Date().toLocaleDateString("pt-BR"),
    tasks: myTasks.map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      startDate: t.startDate,
      endDate: t.endDate,
      completedAt: t.completedAt ?? null,
      timeSpentMinutes: t.timeSpentMinutes ?? 0,
      pomodoroSessions: t.pomodoroSessions ?? 0,
    })),
    stats: {
      total: myTasks.length,
      completed: myTasks.filter((t) => t.status === "COMPLETED").length,
      late: myTasks.filter((t) => t.status === "LATE" || t.isLate).length,
      totalPomodoroMinutes: myTasks.reduce((s, t) => s + (t.timeSpentMinutes ?? 0), 0),
      totalPomodoroSessions: myTasks.reduce((s, t) => s + (t.pomodoroSessions ?? 0), 0),
    },
  };

  return (
    <div className="relative" ref={ref}>
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        <Download className="h-4 w-4" /> Relatório
      </Button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-48 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-card animate-slide-in dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={() => { exportReportPDF(reportData); setOpen(false); }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <FileText className="h-4 w-4 text-rose-500" /> Exportar PDF
          </button>
          <button
            onClick={() => { exportReportCSV(reportData); setOpen(false); }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" /> Exportar CSV
          </button>
        </div>
      )}
    </div>
  );
}
