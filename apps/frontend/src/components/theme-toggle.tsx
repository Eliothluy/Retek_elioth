"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";
import { cn } from "@retekapp/ui";

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return (
    <button
      onClick={toggle}
      className="relative grid h-10 w-10 place-items-center rounded-full text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      aria-label="Alternar tema"
    >
      <Sun className={cn("h-5 w-5 transition-all", theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")} />
      <Moon className={cn("absolute h-5 w-5 transition-all", theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0")} />
    </button>
  );
}
