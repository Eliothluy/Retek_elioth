import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types";

export interface Conversation {
  id: string;
  other: { id: string; name: string; avatarUrl?: string | null; title?: string | null };
  lastMessage: string | null;
  lastMessageAt: string;
  lastSenderId: string | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
  sender: { id: string; name: string; avatarUrl?: string | null };
}

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiFetch<Conversation[]>("/messages/conversations"),
    refetchInterval: 15000,
  });
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => apiFetch<ChatMessage[]>(`/messages/${conversationId}`),
    enabled: !!conversationId,
    refetchInterval: 5000,
  });
}

export function useSendMessage(recipientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      apiFetch<{ conversationId: string; message: ChatMessage }>(`/messages/${recipientId}`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("retek_access_token") : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string>),
    },
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}
