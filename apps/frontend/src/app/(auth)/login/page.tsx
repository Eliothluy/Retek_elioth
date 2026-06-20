"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card } from "@retekapp/ui";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError, setTokens, getAccessToken } from "@/lib/api";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [email, setEmail] = useState("dev1@retek.dev");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      fetchMe().then(() => router.push("/dashboard"));
    }
  }, [searchParams, fetchMe, router]);

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
          Retek
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-slate-400">ou continue com</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/github`}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:shadow-soft"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          GitHub
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth/google`}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:shadow-soft"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </a>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Não tem conta?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Criar conta
        </Link>
      </p>
      <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-400">
        Demo: dev1@retek.dev · password123
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md animate-pulse rounded-2xl bg-slate-200/70 p-8" />}>
      <LoginContent />
    </Suspense>
  );
}
