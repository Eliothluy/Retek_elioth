import type { Metadata } from "next";
export const metadata: Metadata = { title: "Entrar" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-success-500/20 blur-3xl" />
        <div className="relative z-10 flex items-center gap-2 text-xl font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">R</span>
          Retek
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-balance">
            A gestão de tarefas que sua equipe vai amar usar.
          </h1>
          <p className="max-w-md text-lg text-white/80">
            Feed social, ranking, gamificação e notificações em tempo real. Tudo leve, nada estressante.
          </p>
          <div className="flex flex-wrap gap-3 pt-4">
            {["🏆 Ranking", "📰 Feed social", "🔔 Tempo real", "✅ Gamificação"].map((f) => (
              <span key={f} className="rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
                {f}
              </span>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-sm text-white/60">© {new Date().getFullYear()} Retek</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">{children}</div>
    </div>
  );
}
