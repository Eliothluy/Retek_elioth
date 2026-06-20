"use client";

import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { Button, Card, Input, Textarea, Skeleton } from "@retekapp/ui";
import { Modal } from "@/components/ui/modal";
import { useProjects } from "@/hooks/use-misc";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: COLORS[0] });
  const qc = useQueryClient();

  const { refetch } = useQuery({ queryKey: ["projects"], queryFn: () => api.projects.list() });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.projects.create(form);
    setForm({ name: "", description: "", color: COLORS[0] });
    setShowCreate(false);
    await qc.invalidateQueries({ queryKey: ["projects"] });
    refetch();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projetos</h1>
          <p className="text-sm text-slate-500">Organize tarefas em projetos.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Novo projeto
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="overflow-hidden transition-all hover:shadow-card hover:-translate-y-0.5">
              <div className="h-2" style={{ backgroundColor: p.color }} />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: `${p.color}1a` }}>
                    <FolderKanban className="h-5 w-5" style={{ color: p.color }} />
                  </div>
                  <h3 className="font-semibold text-slate-900">{p.name}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-500 line-clamp-2">{p.description ?? "Sem descrição"}</p>
              </div>
            </Card>
          ))}
          {projects.length === 0 && (
            <Card className="col-span-full p-12 text-center">
              <p className="text-4xl">📁</p>
              <p className="mt-2 font-medium text-slate-700">Nenhum projeto ainda</p>
            </Card>
          )}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo projeto">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Nome *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Descrição</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Cor</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-8 w-8 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-slate-400" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit">Criar projeto</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
