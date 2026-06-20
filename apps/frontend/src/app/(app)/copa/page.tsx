"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, RefreshCw, MapPin } from "lucide-react";

const ESPN_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

interface TeamInfo {
  abbreviation: string;
  displayName: string;
  location: string;
  logo: string;
}

interface MatchData {
  id: string;
  name: string;
  date: string;
  status: {
    type: { state: "pre" | "in" | "post"; completed: boolean; shortDetail: string };
    displayClock: string;
  };
  competitors: { homeAway: "home" | "away"; score: string; team: TeamInfo }[];
  venue: { displayName: string };
  groupNote?: string;
}

function formatMatchDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" });
}

function formatMatchTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function MatchCard({ match }: { match: MatchData }) {
  const home = match.competitors.find((c) => c.homeAway === "home");
  const away = match.competitors.find((c) => c.homeAway === "away");
  const isLive = match.status.type.state === "in";
  const isFinished = match.status.type.state === "post";
  const isScheduled = match.status.type.state === "pre";

  return (
    <div
      className={`rounded-xl border p-4 transition-all sm:p-5 ${
        isLive
          ? "border-green-500/50 bg-green-950/20 ring-1 ring-green-500/20"
          : isFinished
            ? "border-slate-700 bg-slate-800/50"
            : "border-slate-700 bg-slate-800"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center justify-end gap-2.5 text-right">
          <span className="text-sm font-semibold text-slate-200 sm:text-base">
            {home?.team.displayName}
          </span>
          <img src={home?.team.logo} alt="" className="h-7 w-7 rounded-full object-contain sm:h-8 sm:w-8" />
        </div>

        <div className="flex flex-col items-center gap-0.5">
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              Ao Vivo
            </span>
          )}
          <div className="text-xl font-bold tabular-nums text-white sm:text-2xl">
            {isScheduled ? "vs" : `${home?.score ?? "?"} × ${away?.score ?? "?"}`}
          </div>
          <span className="text-[11px] text-slate-400 sm:text-xs">
            {isLive
              ? match.status.displayClock
              : isFinished
                ? "Encerrado"
                : formatMatchTime(match.date)}
          </span>
        </div>

        <div className="flex flex-1 items-center gap-2.5">
          <img src={away?.team.logo} alt="" className="h-7 w-7 rounded-full object-contain sm:h-8 sm:w-8" />
          <span className="text-sm font-semibold text-slate-200 sm:text-base">
            {away?.team.displayName}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
        {!isScheduled && match.groupNote && (
          <span>{match.groupNote}</span>
        )}
        {match.venue?.displayName && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {match.venue.displayName}
          </span>
        )}
      </div>
    </div>
  );
}

function MatchSkeleton() {
  return <div className="h-28 animate-pulse rounded-xl bg-slate-800" />;
}

export default function CopaPage() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch(ESPN_URL);
      if (!res.ok) throw new Error("Falha ao carregar");
      const data = await res.json();
      const events: MatchData[] = (data.events ?? []).map((e: any) => {
        const comp = e.competitions?.[0] ?? {};
        return {
          id: e.id,
          name: e.name,
          date: e.date,
          status: comp.status ?? e.status,
          competitors: comp.competitors ?? [],
          venue: comp.venue ?? {},
          groupNote: comp.altGameNote,
        };
      });
      setMatches(events);
      setLastUpdate(new Date());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 30000);
    return () => clearInterval(interval);
  }, [fetchScores]);

  const todayStr = new Date().toDateString();

  const liveMatches = matches.filter((m) => m.status.type.state === "in");
  const finishedToday = matches.filter(
    (m) => m.status.type.state === "post" && new Date(m.date).toDateString() === todayStr
  );
  const todayScheduled = matches.filter(
    (m) => m.status.type.state === "pre" && new Date(m.date).toDateString() === todayStr
  );
  const upcoming = matches.filter(
    (m) => m.status.type.state === "pre" && new Date(m.date).toDateString() !== todayStr
  );
  const otherFinished = matches.filter(
    (m) => m.status.type.state === "post" && new Date(m.date).toDateString() !== todayStr
  );

  const hasContent =
    liveMatches.length > 0 ||
    finishedToday.length > 0 ||
    todayScheduled.length > 0 ||
    upcoming.length > 0 ||
    otherFinished.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Trophy className="h-6 w-6 text-yellow-400" />
              Copa do Mundo 2026
            </h1>
            <p className="text-sm text-slate-500">
              Placar ao vivo e calendário
              {lastUpdate && (
                <span className="ml-1.5 text-xs text-slate-600">
                  · {lastUpdate.toLocaleTimeString("pt-BR")}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchScores}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-400 transition-colors hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>

        {loading && matches.length === 0 && (
          <div className="grid gap-4">
            <MatchSkeleton />
            <MatchSkeleton />
            <MatchSkeleton />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
            <p className="text-sm text-slate-400">Não foi possível carregar os placares.</p>
            <button
              onClick={fetchScores}
              className="mt-3 text-sm font-medium text-brand-400 hover:text-brand-300"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && !hasContent && (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
            <p className="text-sm text-slate-400">Nenhum jogo encontrado no momento.</p>
          </div>
        )}

        {liveMatches.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Ao Vivo
            </h2>
            <div className="grid gap-3">
              {liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        )}

        {todayScheduled.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-base font-semibold text-sky-400">📋 Hoje</h2>
            <div className="grid gap-3">
              {todayScheduled.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        )}

        {finishedToday.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-base font-semibold text-slate-400">✅ Encerrados hoje</h2>
            <div className="grid gap-3">
              {finishedToday.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-base font-semibold text-slate-400">📅 Próximos</h2>
            <div className="grid gap-3">
              {upcoming.map((m) => (
                <div key={m.id} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                  <div className="mb-2 text-xs text-slate-500">
                    {formatMatchDate(m.date)} · {formatMatchTime(m.date)}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-1 items-center justify-end gap-2 text-right">
                      <span className="text-sm font-semibold text-slate-200">
                        {m.competitors.find((c) => c.homeAway === "home")?.team.displayName}
                      </span>
                      <img
                        src={m.competitors.find((c) => c.homeAway === "home")?.team.logo}
                        alt=""
                        className="h-6 w-6 rounded-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500">vs</span>
                    <div className="flex flex-1 items-center gap-2">
                      <img
                        src={m.competitors.find((c) => c.homeAway === "away")?.team.logo}
                        alt=""
                        className="h-6 w-6 rounded-full object-contain"
                      />
                      <span className="text-sm font-semibold text-slate-200">
                        {m.competitors.find((c) => c.homeAway === "away")?.team.displayName}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    {m.groupNote && <span>{m.groupNote}</span>}
                    {m.venue?.displayName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {m.venue.displayName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {otherFinished.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-base font-semibold text-slate-400">📊 Resultados anteriores</h2>
            <div className="grid gap-3">
              {otherFinished.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
