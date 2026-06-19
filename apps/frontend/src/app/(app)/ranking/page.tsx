"use client";

import { useState } from "react";
import { Card, Skeleton } from "@retekgpt/ui";
import { RankingBoard } from "@/components/ranking-board";
import { useRankingAll } from "@/hooks/use-ranking";
import { RANKING_LABELS } from "@/lib/constants";
import type { RankingCategory } from "@/types";

const CATEGORIES = Object.keys(RANKING_LABELS) as RankingCategory[];

export default function RankingPage() {
  const [active, setActive] = useState<RankingCategory>("PERFORMANCE");
  const { data: boards, isLoading } = useRankingAll();
  const entries = boards ? boards[CATEGORIES.indexOf(active)] ?? [] : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">🏆 Ranking de Desenvolvedores</h1>
        <p className="text-sm text-slate-500">Competição saudável para impulsionar a equipe.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const info = RANKING_LABELS[cat]!;
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                isActive ? "border-brand-300 bg-brand-50 ring-2 ring-brand-100" : "border-slate-200 bg-white hover:shadow-soft"
              }`}
            >
              <span className="text-2xl">{info.icon}</span>
              <p className="mt-1 text-sm font-semibold text-slate-900">{info.title}</p>
              <p className="text-[11px] text-slate-500">{info.desc}</p>
            </button>
          );
        })}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xl">{RANKING_LABELS[active]!.icon}</span>
          <h2 className="text-lg font-semibold text-slate-900">{RANKING_LABELS[active]!.title}</h2>
        </div>
        {isLoading ? <Skeleton className="h-64 rounded-2xl" /> : <RankingBoard entries={entries} />}
      </Card>
    </div>
  );
}
