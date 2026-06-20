"use client";

import { useParams } from "next/navigation";
import { AlertTriangle, Bell } from "lucide-react";
import { Card, Badge } from "@retekapp/ui";
import { TaskCard } from "@/components/task-card";
import { useTasks } from "@/hooks/use-tasks";
import { useNotifications } from "@/hooks/use-notifications";
import { timeAgo } from "@/lib/utils";

const META: Record<string, { title: string; desc: string; icon: string }> = {
  empresa: { title: "Empresa", desc: "Visão geral da sua organização", icon: "🏢" },
  alertas: { title: "Alertas", desc: "Tarefas atrasadas e prazos próximos", icon: "🚨" },
  lembretes: { title: "Lembretes", desc: "Lembretes e compromissos da equipe", icon: "📌" },
  ideias: { title: "Ideias", desc: "Mural de ideias e sugestões", icon: "💡" },
  licencas: { title: "Licenças", desc: "Gestão de licenças e softwares", icon: "📜" },
  parcerias: { title: "Parcerias", desc: "Parceiros e colaborações", icon: "🤝" },
  despesas: { title: "Despesas", desc: "Controle de despesas da empresa", icon: "💰" },
  negocios: { title: "Negócios", desc: "Pipeline de oportunidades", icon: "💼" },
  licitaciones: { title: "Licitações", desc: "Acompanhamento de licitações", icon: "📑" },
  analise: { title: "Análise", desc: "Relatórios e indicadores", icon: "📊" },
  empresas: { title: "Empresas", desc: "Cadastro de empresas", icon: "🏛️" },
  competitiva: { title: "Competitiva", desc: "Análise competitiva", icon: "🔍" },
  clientes: { title: "Clientes", desc: "Gestão de clientes", icon: "❤️" },
  usuarios: { title: "Usuários", desc: "Membros da plataforma", icon: "👥" },
};

export function SectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section;
  const meta = META[section] ?? { title: section, desc: "Módulo", icon: "📦" };
  const isAlertas = section === "alertas";

  const { data: tasks = [] } = useTasks({ status: "LATE" });
  const { data: notifications = [] } = useNotifications();
  const lateTasks = tasks;
  const deadlineAlerts = notifications.filter((n) => n.type === "DEADLINE_APPROACHING" || n.type === "TASK_LATE");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{meta.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{meta.title}</h1>
          <p className="text-sm text-slate-500">{meta.desc}</p>
        </div>
      </div>

      {isAlertas ? (
        <div className="space-y-6">
          {lateTasks.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold text-rose-600">
                <AlertTriangle className="h-5 w-5" /> Tarefas atrasadas ({lateTasks.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {lateTasks.map((t) => <TaskCard key={t.id} task={t} />)}
              </div>
            </div>
          )}
          {deadlineAlerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold text-amber-600">
                <Bell className="h-5 w-5" /> Prazos próximos ({deadlineAlerts.length})
              </h2>
              <div className="space-y-2">
                {deadlineAlerts.map((n) => (
                  <Card key={n.id} className="flex items-center gap-3 p-4">
                    <span className="text-xl">⏰</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500">{n.message}</p>
                    </div>
                    <Badge variant="warning">{timeAgo(n.createdAt)}</Badge>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {lateTasks.length === 0 && deadlineAlerts.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-4xl">✅</p>
              <p className="mt-2 font-medium text-slate-700">Nenhum alerta no momento</p>
              <p className="text-sm text-slate-500">Tudo sob controle!</p>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-brand-50 text-4xl">
            {meta.icon}
          </div>
          <h2 className="text-lg font-semibold text-slate-800">{meta.title}</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            {meta.desc}. Este módulo está pronto para integração com seus fluxos de trabalho.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Módulo disponível
          </div>
        </Card>
      )}
    </div>
  );
}
