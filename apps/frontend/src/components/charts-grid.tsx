"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from "@retekapp/ui";
import { useDashboardStats } from "@/hooks/use-stats";
import { STATUS_LABELS } from "@/lib/constants";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#22c55e",
  LATE: "#f43f5e",
};

export function ChartsGrid() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-2xl" />
        ))}
      </div>
    );
  }

  const pieData = stats.tasksByStatus.map((s) => ({
    name: STATUS_LABELS[s.name] ?? s.name,
    value: s.value,
    color: STATUS_COLORS[s.name] ?? "#94a3b8",
  }));

  const radialData = [{ name: "Conclusão", value: stats.completionTrend.completionRate, fill: "#22c55e" }];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Tarefas concluídas por dia */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-sm dark:text-slate-100">📋 Tarefas concluídas (7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.tasksByDay}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#colorTasks)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição de status (donut) */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-sm dark:text-slate-100">📊 Distribuição de status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3">
            {pieData.map((p) => (
              <span key={p.name} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name} ({p.value})
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pontos por dia */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-sm dark:text-slate-100">⚡ Pontos ganhos (7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.pointsByDay}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <Bar dataKey="points" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Taxa de conclusão */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-sm dark:text-slate-100">🎯 Taxa de conclusão</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" data={radialData} startAngle={90} endAngle={90 - 360 * (radialData[0]!.value / 100)}>
              <RadialBar dataKey="value" cornerRadius={10} fill="#22c55e" background={{ fill: "#f1f5f9" }} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 text-2xl font-bold dark:fill-slate-100">
                {stats.completionTrend.completionRate}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
            <div><p className="font-bold text-slate-700 dark:text-slate-300">{stats.completionTrend.completed}</p><p>Concluídas</p></div>
            <div><p className="font-bold text-slate-700 dark:text-slate-300">{stats.completionTrend.inProgress + stats.completionTrend.pending}</p><p>Ativas</p></div>
            <div><p className="font-bold text-rose-500">{stats.completionTrend.late}</p><p>Atrasadas</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
