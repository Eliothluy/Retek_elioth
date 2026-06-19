import { create } from "zustand";

interface FocusState {
  isFocusMode: boolean;
  enterFocus: () => void;
  exitFocus: () => void;
  toggle: () => void;
  shouldSilence: (notificationType: string) => boolean;
}

export const useFocusStore = create<FocusState>((set, get) => ({
  isFocusMode: false,
  enterFocus: () => set({ isFocusMode: true }),
  exitFocus: () => set({ isFocusMode: false }),
  toggle: () => set((s) => ({ isFocusMode: !s.isFocusMode })),
  shouldSilence: (notificationType: string) => {
    if (!get().isFocusMode) return false;
    const critical = ["TASK_ASSIGNED", "TASK_LATE"];
    return !critical.includes(notificationType);
  },
}));
