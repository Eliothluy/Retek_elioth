"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Avatar, Badge, cn } from "@retekgpt/ui";
import type { ActivityFeed as ActivityFeedType } from "@/types";
import { ACTIVITY_LABELS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { useToggleLike, useAddComment } from "@/hooks/use-feed";
import { useAuthStore } from "@/stores/auth-store";

const badgeVariant = (color?: string) =>
  color === "success" ? "success" : color === "danger" ? "danger" : color === "warning" ? "warning" : "neutral";

export function FeedItem({ activity }: { activity: ActivityFeedType }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const toggleLike = useToggleLike();
  const addComment = useAddComment();
  const { user } = useAuthStore();

  const meta = ACTIVITY_LABELS[activity.type] ?? { label: activity.type.toLowerCase(), icon: "📌" };
  const likeCount = activity._count?.likes ?? 0;
  const commentCount = activity._count?.comments ?? 0;
  const likedByMe = activity.likes?.some((l) => l.userId === user?.id) ?? false;

  function handleLike() {
    toggleLike.mutate(activity.id);
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment.mutate({ activityId: activity.id, content: comment.trim() });
    setComment("");
    setShowComments(true);
  }

  const isCompletion = activity.type === "TASK_COMPLETED";

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-soft transition-all hover:shadow-card animate-fade-in",
        isCompletion ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"
      )}
    >
      <div className="flex gap-3">
        <Avatar src={activity.actor.avatarUrl ?? undefined} fallback={activity.actor.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-slate-900">{activity.actor.name}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{timeAgo(activity.createdAt)}</span>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-slate-700">
            <span className="text-base">{meta.icon}</span>
            <span>{meta.label}</span>
            {isCompletion && <span className="text-emerald-600">🎉</span>}
          </p>

          {activity.task && (
            <Link href={`/tasks/${activity.task.id}`} className="mt-3 block rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-slate-800">{activity.task.title}</p>
                <Badge variant={badgeVariant(STATUS_COLORS[activity.task.status])}>
                  {STATUS_LABELS[activity.task.status]}
                </Badge>
              </div>
              {activity.project && (
                <p className="mt-1 text-xs text-slate-500">📁 {activity.project.name}</p>
              )}
            </Link>
          )}

          <div className="mt-3 flex items-center gap-1">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all active:scale-95",
                likedByMe ? "bg-rose-50 text-rose-600" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <Heart className={cn("h-4 w-4", likedByMe && "fill-rose-500 text-rose-500")} />
              {likeCount > 0 && likeCount}
            </button>
            <button
              onClick={() => setShowComments((s) => !s)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-slate-500 transition-all hover:bg-slate-100 active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              {commentCount > 0 && commentCount}
            </button>
          </div>

          {showComments && (
            <div className="mt-3 space-y-3 border-t border-slate-100 pt-3 animate-fade-in">
              {activity.comments?.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar src={c.user.avatarUrl ?? undefined} fallback={c.user.name} size="sm" />
                  <div className="rounded-2xl bg-slate-100 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-700">{c.user.name}</p>
                    <p className="text-sm text-slate-600">{c.content}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(c.createdAt)}</p>
                  </div>
                </div>
              ))}
              {commentCount === 0 && !activity.comments?.length && (
                <p className="text-sm text-slate-400">Seja o primeiro a comentar 💬</p>
              )}
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="h-9 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

