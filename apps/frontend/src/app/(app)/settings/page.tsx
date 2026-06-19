"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "@retekgpt/ui";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    title: user?.title ?? "",
    bio: user?.bio ?? "",
    avatarUrl: user?.avatarUrl ?? "",
  });
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await api.users.update(form);
    await qc.invalidateQueries({ queryKey: ["users"] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500">Atualize seu perfil público.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Nome</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Cargo</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">URL do avatar</label>
              <Input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Bio</label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit">Salvar</Button>
              {saved && <span className="text-sm text-emerald-600 animate-fade-in">✓ Salvo com sucesso</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
