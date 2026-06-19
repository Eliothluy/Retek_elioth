"use client";

import { useState, useEffect } from "react";
import { Pause, Play, X, ChevronUp, Brain, Coffee } from "lucide-react";
import { usePomodoroStore, formatTime, type PomodoroMode } from "@/stores/pomodoro-store";
import { PomodoroTimer } from "./pomodoro-timer";
import { cn } from "@retekgpt/ui";

const MODE_ICON: Record<PomodoroMode, typeof Brain> = {
  work: Brain,
  short_break: Coffee,
  long_break: Coffee,
};

export function PomodoroWidget() {
  const { isRunning, timeLeft, mode, currentTaskId, currentTaskTitle } = usePomodoroStore();
  const pause = usePomodoroStore((s) => s.pause);
  const resume = usePomodoroStore((s) => s.resume);
  const stop = usePomodoroStore((s) => s.stop);
  const [expanded, setExpanded] = useState(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      const { tickInterval } = usePomodoroStore.getState();
      if (tickInterval && !usePomodoroStore.getState().isRunning) {
        clearInterval(tickInterval);
      }
    };
  }, []);

  if (!isRunning && !currentTaskId) return null;

  const ModeIcon = MODE_ICON[mode];
  const isWork = mode === "work";

  if (expanded) {
    return (
      <div className="fixed bottom-6 right-6 z-[90] w-96 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-slide-in">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">🍅 Pomodoro</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setExpanded(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={stop}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <PomodoroTimer />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[90] flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-2xl transition-all hover:shadow-2xl animate-slide-in",
        isWork ? "border-brand-200" : "border-emerald-200"
      )}
    >
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-3"
      >
        <div
          className={cn(
            "grid h-10 w-10 place-items-center rounded-xl text-white",
            isWork ? "gradient-brand" : "gradient-success"
          )}
        >
          <ModeIcon className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className="font-mono text-lg font-bold tabular-nums text-slate-900">
            {formatTime(timeLeft)}
          </p>
          <p className="max-w-40 truncate text-xs text-slate-400">
            {currentTaskTitle ?? "Foco"}
          </p>
        </div>
      </button>

      <div className="ml-1 flex items-center gap-1 border-l border-slate-100 pl-2">
        {isRunning ? (
          <button
            onClick={pause}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <Pause className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={resume}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <Play className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={stop}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
