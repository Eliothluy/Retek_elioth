"use client";

import { Headphones } from "lucide-react";
import { useFocusStore } from "@/stores/focus-store";
import { cn } from "@retekapp/ui";

export function FocusIndicator() {
  const isFocusMode = useFocusStore((s) => s.isFocusMode);

  if (!isFocusMode) return null;

  return (
    <div
      className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
      title="Modo foco ativo — notificações não-críticas silenciadas"
    >
      <Headphones className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Foco</span>
    </div>
  );
}
