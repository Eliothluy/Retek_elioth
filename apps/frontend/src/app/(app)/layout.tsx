"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { AuthGuard } from "@/components/auth-guard";
import { PomodoroWidget } from "@/components/pomodoro-widget";
import { usePomodoroSync } from "@/hooks/use-pomodoro-sync";
import { useAuthStore } from "@/stores/auth-store";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  usePomodoroSync();

  useEffect(() => {
    if (isAuthenticated) connectSocket();
    return () => disconnectSocket();
  }, [isAuthenticated]);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
      <PomodoroWidget />
    </AuthGuard>
  );
}
