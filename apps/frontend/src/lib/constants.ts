export { cn } from "@retekapp/ui";

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  LATE: "Atrasado",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "neutral",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  LATE: "danger",
};

export const PRIORITY_LABELS: Record<string, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

export const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "neutral",
};

export const RANKING_LABELS: Record<string, { title: string; icon: string; desc: string }> = {
  PERFORMANCE: { title: "Top Performance", icon: "🏆", desc: "Pontuação geral + entregas no prazo" },
  COMPLETED: { title: "Top Concluídas", icon: "✅", desc: "Maior número de tarefas concluídas" },
  LATE: { title: "Top Atrasos", icon: "⚠️", desc: "Tarefas que passaram do prazo" },
  ACTIVITY: { title: "Top Atividades", icon: "📊", desc: "Maior engajamento no feed" },
};

export const ACTIVITY_LABELS: Record<string, { label: string; icon: string }> = {
  TASK_CREATED: { label: "criou uma tarefa", icon: "📝" },
  TASK_UPDATED: { label: "atualizou uma tarefa", icon: "✏️" },
  TASK_COMPLETED: { label: "concluiu uma tarefa", icon: "🎉" },
  TASK_LATE: { label: "tem uma tarefa atrasada", icon: "⚠️" },
  COMMENT_POSTED: { label: "comentou", icon: "💬" },
  RANK_UP: { label: "subiu no ranking", icon: "📈" },
  BADGE_EARNED: { label: "ganhou uma badge", icon: "🏅" },
};
