import { create } from "zustand";
import { api } from "@/lib/api";
import { useFocusStore } from "./focus-store";

export type PomodoroMode = "work" | "short_break" | "long_break";

interface PomodoroConfig {
  work: number;
  shortBreak: number;
  longBreak: number;
  sessionsBeforeLong: number;
}

const DEFAULTS: PomodoroConfig = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  sessionsBeforeLong: 4,
};

interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  completedSessions: number;
  currentTaskId: string | null;
  currentTaskTitle: string | null;
  config: PomodoroConfig;
  tickInterval: ReturnType<typeof setInterval> | null;

  start: (taskId: string, taskTitle: string) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  stop: () => void;
  tick: () => void;
  setConfig: (config: Partial<PomodoroConfig>) => void;
}

function durationFor(mode: PomodoroMode, config: PomodoroConfig): number {
  return mode === "work" ? config.work : mode === "short_break" ? config.shortBreak : config.longBreak;
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: "work",
  timeLeft: DEFAULTS.work,
  isRunning: false,
  completedSessions: 0,
  currentTaskId: null,
  currentTaskTitle: null,
  config: DEFAULTS,
  tickInterval: null,

  start: (taskId, taskTitle) => {
    const { tickInterval, config } = get();
    if (tickInterval) clearInterval(tickInterval);
    const interval = setInterval(() => get().tick(), 1000);
    useFocusStore.getState().enterFocus();
    set({
      mode: "work",
      timeLeft: config.work,
      isRunning: true,
      completedSessions: 0,
      currentTaskId: taskId,
      currentTaskTitle: taskTitle,
      tickInterval: interval,
    });
  },

  pause: () => {
    const { tickInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    useFocusStore.getState().exitFocus();
    set({ isRunning: false, tickInterval: null });
  },

  resume: () => {
    const { isRunning, tickInterval, mode } = get();
    if (isRunning) return;
    if (tickInterval) clearInterval(tickInterval);
    if (mode === "work") useFocusStore.getState().enterFocus();
    const interval = setInterval(() => get().tick(), 1000);
    set({ isRunning: true, tickInterval: interval });
  },

  reset: () => {
    const { mode, config } = get();
    set({ timeLeft: durationFor(mode, config) });
  },

  skip: () => {
    const { mode, completedSessions, config } = get();
    if (mode === "work") {
      const newCount = completedSessions + 1;
      const nextMode: PomodoroMode = newCount % config.sessionsBeforeLong === 0 ? "long_break" : "short_break";
      set({ mode: nextMode, timeLeft: durationFor(nextMode, config), completedSessions: newCount });
    } else {
      set({ mode: "work", timeLeft: config.work });
    }
  },

  stop: () => {
    const { tickInterval } = get();
    if (tickInterval) clearInterval(tickInterval);
    useFocusStore.getState().exitFocus();
    set({
      mode: "work",
      timeLeft: get().config.work,
      isRunning: false,
      completedSessions: 0,
      currentTaskId: null,
      currentTaskTitle: null,
      tickInterval: null,
    });
  },

  tick: () => {
    const { timeLeft, mode, completedSessions, config, currentTaskId } = get();
    if (timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
      return;
    }
    // Session ended — transition
    if (mode === "work") {
      const newCount = completedSessions + 1;
      const nextMode: PomodoroMode = newCount % config.sessionsBeforeLong === 0 ? "long_break" : "short_break";
      set({ mode: nextMode, timeLeft: durationFor(nextMode, config), completedSessions: newCount });
      // Record the completed pomodoro session in the backend
      if (currentTaskId) {
        const minutes = Math.round(config.work / 60);
        api.tasks.recordPomodoro(currentTaskId, minutes).catch(() => {
          // silently fail — the timer continues regardless
        });
      }
    } else {
      set({ mode: "work", timeLeft: config.work });
    }
  },

  setConfig: (partial) => {
    const config = { ...get().config, ...partial };
    const { mode, isRunning } = get();
    if (!isRunning) {
      set({ config, timeLeft: durationFor(mode, config) });
    } else {
      set({ config });
    }
  },
}));

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
