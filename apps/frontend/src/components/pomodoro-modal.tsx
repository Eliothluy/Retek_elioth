"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { usePomodoroStore } from "@/stores/pomodoro-store";
import { Button } from "@retekapp/ui";

interface PomodoroModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  onComplete?: () => void;
}

export function PomodoroModal({ open, onClose, taskId, taskTitle, onComplete }: PomodoroModalProps) {
  const start = usePomodoroStore((s) => s.start);
  const stop = usePomodoroStore((s) => s.stop);
  const isRunning = usePomodoroStore((s) => s.isRunning);
  const completedSessions = usePomodoroStore((s) => s.completedSessions);

  // Start the timer when modal opens
  useEffect(() => {
    if (open) {
      start(taskId, taskTitle);
    }
  }, [open, taskId, taskTitle, start]);

  function handleClose() {
    // Just close the modal — timer keeps running in background
    onClose();
  }

  function handleStop() {
    stop();
    onClose();
  }

  function handleComplete() {
    stop();
    onComplete?.();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="🍅 Modo Pomodoro"
      description={taskTitle}
      className="max-w-md"
    >
      <div className="space-y-6">
        <div className="rounded-xl bg-brand-50/60 px-4 py-3 text-center">
          <p className="text-sm text-slate-500">Trabalhando em</p>
          <p className="font-semibold text-slate-900">{taskTitle}</p>
        </div>

        <PomodoroTimer />

        {completedSessions > 0 && (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700 animate-fade-in">
            🎉 {completedSessions} sessão{completedSessions !== 1 ? "ões" : ""} de foco concluída{completedSessions !== 1 ? "s" : ""}!
          </div>
        )}

        <div className="flex justify-center gap-2 border-t border-slate-100 pt-4">
          <Button variant="ghost" onClick={handleClose}>
            Minimizar
          </Button>
          <Button variant="outline" onClick={handleStop}>
            Parar timer
          </Button>
          <Button variant="success" onClick={handleComplete}>
            <CheckCircle2 className="h-4 w-4" /> Concluir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
