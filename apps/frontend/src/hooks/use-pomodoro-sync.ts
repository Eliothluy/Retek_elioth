import { useQueryClient } from "@tanstack/react-query";
import { usePomodoroStore } from "@/stores/pomodoro-store";
import { useEffect, useRef } from "react";

export function usePomodoroSync() {
  const queryClient = useQueryClient();
  const completedSessions = usePomodoroStore((s) => s.completedSessions);
  const prevSessions = useRef(completedSessions);

  useEffect(() => {
    if (completedSessions !== prevSessions.current) {
      prevSessions.current = completedSessions;
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["ranking"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
  }, [completedSessions, queryClient]);
}
