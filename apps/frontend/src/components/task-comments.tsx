"use client";

import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Avatar, Card, CardHeader, CardTitle, cn } from "@retekapp/ui";
import { useTaskComments, useAddComment, useDeleteComment } from "@/hooks/use-task-comments";
import { useAuthStore } from "@/stores/auth-store";
import { MarkdownRenderer } from "./markdown-renderer";
import { timeAgo } from "@/lib/utils";

export function TaskComments({ taskId }: { taskId: string }) {
  const { data: comments = [] } = useTaskComments(taskId);
  const addComment = useAddComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const { user } = useAuthStore();
  const [content, setContent] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    addComment.mutate(content.trim());
    setContent("");
  }

  return (
    <Card className="dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="dark:text-slate-100">Comentários ({comments.length})</CardTitle>
      </CardHeader>
      <div className="space-y-4 p-5 pt-0">
        {comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">Nenhum comentário ainda. Seja o primeiro! 💬</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar src={c.user.avatarUrl ?? undefined} fallback={c.user.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.user.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                      {c.userId === user?.id && (
                        <button
                          onClick={() => deleteComment.mutate(c.id)}
                          className="text-slate-300 transition-colors hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 dark:bg-slate-700">
                    <MarkdownRenderer content={c.content} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
          <Avatar src={user?.avatarUrl ?? undefined} fallback={user?.name ?? "?"} size="sm" />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva um comentário... (suporta markdown)"
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-300 focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
          <button
            type="submit"
            disabled={!content.trim() || addComment.isPending}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </Card>
  );
}
