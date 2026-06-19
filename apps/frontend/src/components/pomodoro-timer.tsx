"use client";

import { Pause, Play, SkipForward, RotateCcw, X, Coffee, Brain, CheckCircle2 } from "lucide-react";
import { usePomodoroStore, formatTime, type PomodoroMode } from "@/stores/pomodoro-store";
import { cn } from "@retekgpt/ui";
import { useEffect, useRef } from "react";

const MODE_META: Record<PomodoroMode, { label: string; icon: typeof Brain; color: string; ring: string; bg: string }> = {
  work: { label: "Foco", icon: Brain, color: "text-brand-600", ring: "stroke-brand-500", bg: "from-brand-500 to-brand-700" },
  short_break: { label: "Pausa curta", icon: Coffee, color: "text-emerald-600", ring: "stroke-emerald-500", bg: "from-emerald-500 to-emerald-700" },
  long_break: { label: "Pausa longa", icon: Coffee, color: "text-emerald-600", ring: "stroke-emerald-500", bg: "from-emerald-500 to-teal-700" },
};

const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PomodoroTimer() {
  const { mode, timeLeft, isRunning, completedSessions, currentTaskTitle, config } = usePomodoroStore();
  const start = usePomodoroStore((s) => s.start);
  const pause = usePomodoroStore((s) => s.pause);
  const resume = usePomodoroStore((s) => s.resume);
  const reset = usePomodoroStore((s) => s.reset);
  const skip = usePomodoroStore((s) => s.skip);
  const stop = usePomodoroStore((s) => s.stop);

  const meta = MODE_META[mode];
  const totalDuration = mode === "work" ? config.work : mode === "short_break" ? config.shortBreak : config.longBreak;
  const progress = 1 - timeLeft / totalDuration;
  const offset = CIRCUMFERENCE * (1 - progress);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const prevModeRef = useRef(mode);

  // Play a soft beep when mode transitions
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      prevModeRef.current = mode;
      playBeep();
      if (typeof window !== "undefined") {
        const label = MODE_META[mode].label;
        document.title = `🍅 ${label} — ${formatTime(timeLeft)}`;
      }
    }
  }, [mode, timeLeft]);

  // Update document title with countdown
  useEffect(() => {
    if (typeof window !== "undefined" && currentTaskTitle) {
      document.title = `🍅 ${meta.label} ${formatTime(timeLeft)} — ${currentTaskTitle}`;
    }
    return () => {
      if (typeof window !== "undefined") document.title = "RetekGPT — Gestão de Tarefas para Devs";
    };
  }, [timeLeft, mode, currentTaskTitle, meta.label]);

  function playBeep() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = mode === "work" ? 660 : 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      /* audio not available */
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Mode pills */}
      <div className="mb-6 flex gap-2">
        {(["work", "short_break", "long_break"] as PomodoroMode[]).map((m) => {
          const mMeta = MODE_META[m];
          const isActive = mode === m;
          return (
            <span
              key={m}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all",
                isActive ? cn("bg-gradient-to-r text-white", mMeta.bg) : "bg-slate-100 text-slate-400"
              )}
            >
              {mMeta.label}
            </span>
          );
        })}
      </div>

      {/* Circular timer */}
      <div className="relative h-72 w-72">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 280 280">
          <circle
            cx="140"
            cy="140"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-100"
          />
          <circle
            cx="140"
            cy="140"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className={cn("transition-all duration-1000 ease-linear", meta.ring)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <meta.icon className={cn("mb-2 h-7 w-7", meta.color)} />
          <span className="font-mono text-5xl font-bold tabular-nums text-slate-900">
            {formatTime(timeLeft)}
          </span>
          <span className="mt-1 text-sm font-medium text-slate-400">{meta.label}</span>
        </div>
      </div>

      {/* Session dots */}
      <div className="mt-5 flex items-center gap-1.5">
        {Array.from({ length: config.sessionsBeforeLong }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              i < completedSessions % config.sessionsBeforeLong || (completedSessions > 0 && completedSessions % config.sessionsBeforeLong === 0)
                ? "bg-brand-500"
                : "bg-slate-200"
            )}
          />
        ))}
        <span className="ml-2 text-xs text-slate-400">
          {completedSessions} sessão{completedSessions !== 1 ? "ões" : ""} concluída{completedSessions !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 active:scale-95"
          aria-label="Reiniciar"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        {isRunning ? (
          <button
            onClick={pause}
            className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
            aria-label="Pausar"
          >
            <Pause className="h-7 w-7" />
          </button>
        ) : (
          <button
            onClick={resume}
            className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
            aria-label="Iniciar"
          >
            <Play className="ml-1 h-7 w-7" />
          </button>
        )}

        <button
          onClick={skip}
          className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 active:scale-95"
          aria-label="Pular"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      <button
        onClick={stop}
        className="mt-5 flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-rose-500"
      >
        <X className="h-4 w-4" /> Encerrar Pomodoro
      </button>
    </div>
  );
}
