import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";
import { api, setTokens, clearTokens, getRefreshToken } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string, title?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      async login(email, password) {
        set({ isLoading: true });
        try {
          const res = await api.auth.login({ email, password });
          setTokens(res.accessToken, res.refreshToken);
          const user = await api.auth.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      async register(email, name, password, title) {
        set({ isLoading: true });
        try {
          const res = await api.auth.register({ email, name, password, title });
          setTokens(res.accessToken, res.refreshToken);
          const user = await api.auth.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      async logout() {
        const refreshToken = getRefreshToken();
        try {
          if (refreshToken) await api.auth.logout(refreshToken);
        } catch {
          /* ignore */
        }
        clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      async fetchMe() {
        try {
          const user = await api.auth.me();
          set({ user, isAuthenticated: true });
        } catch {
          clearTokens();
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "retek-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
