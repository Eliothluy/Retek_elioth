"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card } from "@retekgpt/ui";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [email, setEmail] = useState("dev1@retekgpt.dev");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao entrar");
    }
  }

  return (
    <Card className="w-full max-w-md border-none p-8 shadow-card">
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white">R</span>
          RetekGPT
        </div>
        <h2 className="text-xl font-semibold text-slate-700">Bem-vindo de volta 👋</h2>
        <p className="text-sm text-slate-500">Entre para continuar gerenciando suas tarefas.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Senha</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Não tem conta?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Criar conta
        </Link>
      </p>
      <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-400">
        Demo: dev1@retekgpt.dev · password123
      </p>
    </Card>
  );
}
