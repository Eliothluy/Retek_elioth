"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, cn } from "@retekapp/ui";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { requestNotificationPermission, getNotificationPermission, isNotificationSupported, showLocalNotification } from "@/lib/push";

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
  const [notifPermission, setNotifPermission] = useState("default");
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
    const stored = localStorage.getItem("retek-push-enabled");
    setPushEnabled(stored === "true");
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await api.users.update(form);
    await qc.invalidateQueries({ queryKey: ["users"] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleEnablePush() {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotifPermission("granted");
      setPushEnabled(true);
      localStorage.setItem("retek-push-enabled", "true");
      showLocalNotification("Retek 🔔", {
        body: "Notificações push ativadas com sucesso!",
        tag: "push-enabled",
      });
    } else {
      setNotifPermission("denied");
    }
  }

  function handleDisablePush() {
    setPushEnabled(false);
    localStorage.setItem("retek-push-enabled", "false");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Configurações</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Atualize seu perfil e preferências.</p>
      </div>

      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Cargo</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">URL do avatar</label>
              <Input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit">Salvar</Button>
              {saved && <span className="text-sm text-emerald-600 animate-fade-in">✓ Salvo com sucesso</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-slate-100">🔔 Notificações Push</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isNotificationSupported() ? (
            <p className="text-sm text-slate-400">Seu navegador não suporta notificações push.</p>
          ) : notifPermission === "denied" ? (
            <p className="text-sm text-rose-500">
              As notificações foram bloqueadas. Habilite nas configurações do navegador para receber alertas.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Notificações do navegador</p>
                  <p className="text-xs text-slate-400">
                    {pushEnabled ? "Ativadas — você receberá alertas de tarefas" : "Desativadas"}
                  </p>
                </div>
                {pushEnabled ? (
                  <Button variant="outline" size="sm" onClick={handleDisablePush}>
                    <BellOff className="h-4 w-4" /> Desativar
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={handleEnablePush}>
                    <Bell className="h-4 w-4" /> Ativar
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
                <Check className="h-3.5 w-3.5" />
                Receba alertas de novas tarefas, prazos próximos e conclusões mesmo com a aba em segundo plano.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
