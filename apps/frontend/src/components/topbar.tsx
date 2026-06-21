"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, LogOut, User as UserIcon, Settings, Zap } from "lucide-react";
import { Avatar, Button, cn } from "@retekapp/ui";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme-toggle";
import { FocusIndicator } from "./focus-indicator";
import { useAuthStore } from "@/stores/auth-store";
import { Sec365Logo } from "./sec365-logo";

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/80 sm:px-6">
      <Sec365Logo className="h-7 shrink-0" />
      <div className="relative hidden flex-1 sm:block sm:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Buscar tarefas, projetos, pessoas..."
          className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:focus:bg-slate-600 dark:focus:ring-brand-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 md:flex dark:bg-amber-900/30 dark:text-amber-400">
          <Zap className="h-4 w-4" />
          {user?.points ?? 0} pts
        </div>

        <FocusIndicator />
        <ThemeToggle />
        <NotificationBell />

        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Avatar src={user?.avatarUrl ?? undefined} fallback={user?.name ?? "?"} size="sm" />
            <span className="hidden text-sm font-medium text-slate-700 sm:block dark:text-slate-200">{user?.name}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-card animate-slide-in dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <UserIcon className="h-4 w-4" /> Meu perfil
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Settings className="h-4 w-4" /> Configurações
              </Link>
              <button
                onClick={handleLogout}
                className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30")}
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
