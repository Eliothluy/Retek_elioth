"use client";

import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, Search } from "lucide-react";
import { Avatar, Card, cn } from "@retekapp/ui";
import { useConversations, useMessages, useSendMessage } from "@/hooks/use-messages";
import { useUsers } from "@/hooks/use-misc";
import { useAuthStore } from "@/stores/auth-store";
import { timeAgo } from "@/lib/utils";

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { data: conversations = [] } = useConversations();
  const { data: users = [] } = useUsers();
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conv = conversations.find((c) => c.id === selectedConv);
  const recipientId = conv?.other.id ?? selectedRecipient;
  const { data: messages = [] } = useMessages(selectedConv);
  const sendMessage = useSendMessage(recipientId ?? "");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !recipientId) return;
    sendMessage.mutate(content.trim());
    setContent("");
  }

  function startNewChat(userId: string) {
    setSelectedRecipient(userId);
    setSelectedConv(null);
  }

  const filteredUsers = users.filter(
    (u) => u.id !== user?.id && u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-6xl gap-4">
      {/* Lista de conversas */}
      <Card className="flex w-72 shrink-0 flex-col overflow-hidden dark:bg-slate-800 lg:w-80">
        <div className="border-b border-slate-100 p-4 dark:border-slate-700">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <MessageCircle className="h-5 w-5 text-brand-500" /> Mensagens
          </h2>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pessoas..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm outline-none focus:border-brand-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {search && filteredUsers.length > 0 && (
            <div className="border-b border-slate-100 p-2 dark:border-slate-700">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Iniciar conversa</p>
              {filteredUsers.slice(0, 5).map((u) => (
                <button
                  key={u.id}
                  onClick={() => { startNewChat(u.id); setSearch(""); }}
                  className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Avatar src={u.avatarUrl ?? undefined} fallback={u.name} size="sm" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{u.name}</span>
                </button>
              ))}
            </div>
          )}

          {conversations.length === 0 && !search ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              Nenhuma conversa ainda. Busque alguém acima para começar! 💬
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedConv(c.id); setSelectedRecipient(null); }}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-slate-50 p-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700",
                  selectedConv === c.id && "bg-brand-50/50 dark:bg-brand-900/20"
                )}
              >
                <Avatar src={c.other.avatarUrl ?? undefined} fallback={c.other.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{c.other.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {c.lastSenderId === user?.id ? "Você: " : ""}
                    {c.lastMessage ?? "Sem mensagens"}
                  </p>
                </div>
                <span className="text-[10px] text-slate-300">{timeAgo(c.lastMessageAt)}</span>
              </button>
            ))
          )}
        </div>
      </Card>

      {/* Janela de mensagens */}
      <Card className="flex flex-1 flex-col overflow-hidden dark:bg-slate-800">
        {recipientId ? (
          <>
            {(() => {
              const otherUser = conv?.other ?? users.find((u) => u.id === recipientId);
              return (
                <div className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-700">
                  <Avatar src={otherUser?.avatarUrl ?? undefined} fallback={otherUser?.name ?? "?"} />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{otherUser?.name}</p>
                    <p className="text-xs text-slate-400">{otherUser?.title ?? ""}</p>
                  </div>
                </div>
              );
            })()}

            <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-400">Diga olá! 👋</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={cn("flex items-end gap-2", isMe && "flex-row-reverse")}>
                      {!isMe && <Avatar src={m.sender.avatarUrl ?? undefined} fallback={m.sender.name} size="sm" />}
                      <div
                        className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                          isMe
                            ? "rounded-br-sm bg-brand-600 text-white"
                            : "rounded-bl-sm bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={cn("mt-0.5 text-[10px]", isMe ? "text-brand-200" : "text-slate-400")}>
                          {timeAgo(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-100 p-3 dark:border-slate-700">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-300 focus:bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
              <button
                type="submit"
                disabled={!content.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-400">
            <MessageCircle className="h-16 w-16 text-slate-200" />
            <p className="text-sm">Selecione uma conversa ou inicie uma nova</p>
          </div>
        )}
      </Card>
    </div>
  );
}
