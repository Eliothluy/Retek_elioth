"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Skeleton } from "@retekgpt/ui";
import { FeedItem } from "@/components/feed-item";
import { useFeed } from "@/hooks/use-feed";
import { connectSocket } from "@/lib/socket";

export default function FeedPage() {
  const { data: feed = [], isLoading } = useFeed();
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;
    const handler = () => queryClient.invalidateQueries({ queryKey: ["feed"] });
    socket.on("feed:new", handler);
    socket.on("feed:likeAdded", handler);
    socket.on("feed:likeRemoved", handler);
    socket.on("feed:COMMENT_ADDED", handler);
    return () => {
      socket.off("feed:new", handler);
      socket.off("feed:likeAdded", handler);
      socket.off("feed:likeRemoved", handler);
    };
  }, [queryClient]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Feed</h1>
        <p className="text-sm text-slate-500">Acompanhe a atividade da equipe em tempo real.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : feed.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-4xl">📰</p>
          <p className="mt-2 font-medium text-slate-700">Feed vazio</p>
          <p className="text-sm text-slate-500">Crie ou conclua tarefas para gerar atividade.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {feed.map((a) => <FeedItem key={a.id} activity={a} />)}
        </div>
      )}
    </div>
  );
}
