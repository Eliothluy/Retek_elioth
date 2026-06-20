"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  userName: string;
  tasks: {
    title: string;
    status: string;
    priority: string;
    startDate: string;
    endDate: string;
    completedAt: string | null;
    timeSpentMinutes: number;
    pomodoroSessions: number;
  }[];
  stats: {
    total: number;
    completed: number;
    late: number;
    totalPomodoroMinutes: number;
    totalPomodoroSessions: number;
  };
  period: string;
}

export function exportReportPDF(data: ReportData) {
  const doc = new jsPDF();

  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Retek — Relatório de Produtividade", 14, 15);
  doc.setFontSize(10);
  doc.text(`Período: ${data.period}`, 14, 22);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text(`Desenvolvedor: ${data.userName}`, 14, 42);

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total de tarefas: ${data.stats.total}`, 14, 52);
  doc.text(`Concluídas: ${data.stats.completed}`, 70, 52);
  doc.text(`Atrasadas: ${data.stats.late}`, 120, 52);
  doc.text(`Tempo de foco: ${Math.floor(data.stats.totalPomodoroMinutes / 60)}h ${data.stats.totalPomodoroMinutes % 60}min`, 14, 60);
  doc.text(`Sessões Pomodoro: ${data.stats.totalPomodoroSessions}`, 90, 60);

  const completionRate = data.stats.total > 0 ? Math.round((data.stats.completed / data.stats.total) * 100) : 0;
  doc.setFontSize(16);
  doc.setTextColor(34, 197, 94);
  doc.text(`Taxa de conclusão: ${completionRate}%`, 14, 72);

  autoTable(doc, {
    startY: 80,
    head: [["Tarefa", "Status", "Prioridade", "Fim", "Foco (min)", "🍅"]],
    body: data.tasks.map((t) => [
      t.title.slice(0, 40),
      t.status,
      t.priority,
      t.endDate.slice(0, 10),
      String(t.timeSpentMinutes),
      String(t.pomodoroSessions),
    ]),
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`retek-relatorio-${data.userName.toLowerCase().replace(/\s/g, "-")}-${Date.now()}.pdf`);
}

export function exportReportCSV(data: ReportData) {
  const headers = ["Tarefa", "Status", "Prioridade", "Data Inicio", "Data Fim", "Concluida em", "Minutos Foco", "Sessoes Pomodoro"];
  const rows = data.tasks.map((t) => [
    `"${t.title.replace(/"/g, '""')}"`,
    t.status,
    t.priority,
    t.startDate.slice(0, 10),
    t.endDate.slice(0, 10),
    t.completedAt ? t.completedAt.slice(0, 10) : "—",
    String(t.timeSpentMinutes),
    String(t.pomodoroSessions),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `retek-relatorio-${data.userName.toLowerCase().replace(/\s/g, "-")}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
