"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card } from "@retekgpt/ui";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [form, setForm] = useState({ name: "", email: "", title: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register(form.email, form.name, form.password, form.title || undefined);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao registrar");
    }
  }

  return (
    <Card className="w-full max-w-md border-none p-8 shadow-card">
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white">R</span>
          RetekGPT
        </div>
        <h2 className="text-xl font-semibold text-slate-700">Crie sua conta 🚀</h2>
        <p className="text-sm text-slate-500">Junte-se à sua equipe em segundos.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Nome</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Cargo / Título</label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Frontend Engineer" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Senha</label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        </div>

        {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
