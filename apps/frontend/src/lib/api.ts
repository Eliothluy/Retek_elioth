import type { AuthResponse, User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "retek_access_token";
const REFRESH_KEY = "retek_refresh_token";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as AuthResponse;
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/api${path}`, { ...options, headers });

  if (res.status === 401 && !path.startsWith("/auth/")) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens().finally(() => {
        isRefreshing = false;
      });
    }
    const refreshed = await refreshPromise;
    if (refreshed) return apiFetch<T>(path, options);
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError(401, "Session expired");
  }

  if (!res.ok) {
    let message = "Request failed";
    let details: unknown;
    try {
      const body = await res.json();
      message = typeof body.message === "string" ? body.message : JSON.stringify(body.message);
      details = body.details;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message, details);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  auth: {
    register: (body: { email: string; name: string; password: string; title?: string }) =>
      apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    logout: (refreshToken: string) =>
      apiFetch("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }),
    me: () => apiFetch<User>("/auth/me"),
  },
  users: {
    list: () => apiFetch<User[]>("/users"),
    me: () => apiFetch<User>("/users/me"),
    update: (body: Partial<User>) =>
      apiFetch<User>("/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  },
  tasks: {
    list: (params?: { status?: string; assigneeId?: string; projectId?: string }) => {
      const qs = new URLSearchParams(
        Object.entries(params ?? {}).filter(([, v]) => v) as [string, string][]
      ).toString();
      return apiFetch<import("@/types").Task[]>(`/tasks${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => apiFetch<import("@/types").Task>(`/tasks/${id}`),
    create: (body: Record<string, unknown>) =>
      apiFetch<import("@/types").Task>("/tasks", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Record<string, unknown>) =>
      apiFetch<import("@/types").Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    updateStatus: (id: string, status: string) =>
      apiFetch<{ id: string; status: string; pointsAwarded: number }>(`/tasks/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    recordPomodoro: (id: string, minutes: number) =>
      apiFetch<{ timeSpentMinutes: number; pomodoroSessions: number; bonusPoints: number }>(`/tasks/${id}/pomodoro`, {
        method: "POST",
        body: JSON.stringify({ minutes }),
      }),
    remove: (id: string) => apiFetch(`/tasks/${id}`, { method: "DELETE" }),
  },
  projects: {
    list: () => apiFetch<import("@/types").Project[]>("/projects"),
    create: (body: { name: string; description?: string; color?: string }) =>
      apiFetch<import("@/types").Project>("/projects", { method: "POST", body: JSON.stringify(body) }),
  },
  feed: {
    list: (cursor?: string) =>
      apiFetch<import("@/types").ActivityFeed[]>(`/feed${cursor ? `?cursor=${cursor}` : ""}`),
    like: (activityId: string) =>
      apiFetch<{ liked: boolean }>(`/feed/like/${activityId}`, { method: "POST" }),
    comment: (activityId: string, content: string) =>
      apiFetch<import("@/types").Comment>("/feed/comment", {
        method: "POST",
        body: JSON.stringify({ activityId, content }),
      }),
    comments: (activityId: string) =>
      apiFetch<import("@/types").Comment[]>(`/feed/comment/${activityId}`),
  },
  notifications: {
    list: () => apiFetch<import("@/types").Notification[]>("/notifications"),
    unreadCount: () => apiFetch<{ count: number }>("/notifications/unread-count"),
    markRead: (ids: string[]) =>
      apiFetch("/notifications/read", { method: "PATCH", body: JSON.stringify({ ids }) }),
    markAllRead: () => apiFetch("/notifications/read-all", { method: "POST" }),
  },
  ranking: {
    all: () => apiFetch<import("@/types").RankingEntry[][]>("/ranking"),
    category: (cat: string) => apiFetch<import("@/types").RankingEntry[]>(`/ranking/${cat}`),
  },
};

export { API_URL };
