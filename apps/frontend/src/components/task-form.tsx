"use client";

import { useState } from "react";
import { Button, Input, Textarea, Select } from "@retekgpt/ui";
import { useProjects, useUsers } from "@/hooks/use-misc";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { toInputDate } from "@/lib/utils";
import { MarkdownEditor } from "./markdown-editor";

interface TaskFormProps {
  task?: Task | null;
  onDone?: () => void;
}

export function TaskForm({ task, onDone }: TaskFormProps) {
  const { data: projects = [] } = useProjects();
  const { data: users = [] } = useUsers();
  const create = useCreateTask();
  const update = useUpdateTask(task?.id ?? "");

  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    module: task?.module ?? "",
    projectId: task?.projectId ?? "",
    assigneeId: task?.assigneeId ?? "",
    startDate: task ? toInputDate(task.startDate) : toInputDate(new Date()),
    endDate: task ? toInputDate(task.endDate) : toInputDate(new Date(Date.now() + 7 * 86400000)),
    status: task?.status ?? "PENDING",
    priority: task?.priority ?? "MEDIUM",
    alert: task?.alert ?? false,
  });

  const isEdit = !!task;
  const pending = create.isPending || update.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      title: form.title,
      description: form.description || undefined,
      module: form.module || undefined,
      projectId: form.projectId || undefined,
      assigneeId: form.assigneeId || undefined,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      priority: form.priority,
      alert: form.alert,
    };
    if (isEdit) {
      payload.status = form.status;
      await update.mutateAsync(payload);
    } else {
      await create.mutateAsync(payload);
    }
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Tarefa *</label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Ex: Implementar autenticação" />
      </div>

      <MarkdownEditor
        label="Descrição"
        value={form.description}
        onChange={(v) => setForm({ ...form, description: v })}
        rows={4}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Módulo</label>
          <Input value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} placeholder="Ex: auth" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Projeto</label>
          <Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
            <option value="">Sem projeto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Responsável</label>
        <Select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
          <option value="">Sem responsável</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Data de Início *</label>
          <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Data de Fim *</label>
          <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Prioridade</label>
          <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Média</option>
            <option value="LOW">Baixa</option>
          </Select>
        </div>
        {isEdit && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}>
              <option value="PENDING">Pendente</option>
              <option value="IN_PROGRESS">Em andamento</option>
              <option value="COMPLETED">Concluído</option>
              <option value="LATE">Atrasado</option>
            </Select>
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.alert}
          onChange={(e) => setForm({ ...form, alert: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Ativar alerta de prazo próximo
      </label>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="button" variant="ghost" onClick={onDone}>Cancelar</Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar tarefa"}
        </Button>
      </div>
    </form>
  );
}
