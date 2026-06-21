"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Rss,
  CheckSquare,
  FolderKanban,
  Trophy,
  Bell,
  Calendar,
  MessageCircle,
  Building2,
  AlertTriangle,
  Lightbulb,
  StickyNote,
  BadgeCheck,
  Handshake,
  Receipt,
  Briefcase,
  FileText,
  BarChart3,
  Search,
  Users,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@retekapp/ui";
import { useUnreadCount } from "@/hooks/use-notifications";
import { Sec365Logo } from "./sec365-logo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  active?: boolean;
}

function NavGroup({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            item.active
              ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
          )}
        >
          <item.icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110",
              item.active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
            )}
          />
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: unread } = useUnreadCount();
  const alertCount = unread?.count ?? 0;

  const active = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const principal: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: active("/dashboard") },
    { label: "Feed", href: "/feed", icon: Rss, active: active("/feed") },
    { label: "Tarefas", href: "/tasks", icon: CheckSquare, active: active("/tasks") },
    { label: "Calendário", href: "/calendar", icon: Calendar, active: active("/calendar") },
    { label: "Projetos", href: "/projects", icon: FolderKanban, active: active("/projects") },
    { label: "Ranking", href: "/ranking", icon: Trophy, active: active("/ranking") },
    { label: "Mensagens", href: "/messages", icon: MessageCircle, active: active("/messages") },
    { label: "Copa do Mundo", href: "/copa", icon: Trophy, active: active("/copa") },
    {
      label: "Notificações",
      href: "/notifications",
      icon: Bell,
      badge: alertCount,
      active: active("/notifications"),
    },
  ];

  const empresa: NavItem[] = [
    { label: "Empresa", href: "/empresa/empresa", icon: Building2, active: active("/empresa/empresa") },
    { label: "Alertas", href: "/empresa/alertas", icon: AlertTriangle, badge: alertCount, active: active("/empresa/alertas") },
    { label: "Lembretes", href: "/empresa/lembretes", icon: StickyNote, active: active("/empresa/lembretes") },
    { label: "Ideias", href: "/empresa/ideias", icon: Lightbulb, active: active("/empresa/ideias") },
    { label: "Licenças", href: "/empresa/licencas", icon: BadgeCheck, active: active("/empresa/licencas") },
    { label: "Parcerias", href: "/empresa/parcerias", icon: Handshake, active: active("/empresa/parcerias") },
    { label: "Tarefas", href: "/tasks", icon: CheckSquare, active: active("/tasks") },
    { label: "Projetos", href: "/projects", icon: FolderKanban, active: active("/projects") },
    { label: "Despesas", href: "/empresa/despesas", icon: Receipt, active: active("/empresa/despesas") },
  ];

  const negocios: NavItem[] = [
    { label: "Negócios", href: "/negocios/negocios", icon: Briefcase, active: active("/negocios/negocios") },
    { label: "Licitações", href: "/negocios/licitaciones", icon: FileText, active: active("/negocios/licitaciones") },
    { label: "Análise", href: "/negocios/analise", icon: BarChart3, active: active("/negocios/analise") },
    { label: "Empresas", href: "/negocios/empresas", icon: Building2, active: active("/negocios/empresas") },
    { label: "Competitiva", href: "/negocios/competitiva", icon: Search, active: active("/negocios/competitiva") },
    { label: "Clientes", href: "/negocios/clientes", icon: HeartHandshake, active: active("/negocios/clientes") },
    { label: "Usuários", href: "/negocios/usuarios", icon: Users, active: active("/negocios/usuarios") },
  ];

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-700 dark:bg-slate-800">
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white shadow-soft">R</span>
        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Retek</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6 scrollbar-thin">
        <NavGroup title="Principal" items={principal} />
        <NavGroup title="Menu Empresa" items={empresa} />
        <NavGroup title="Menu Negócios" items={negocios} />
      </nav>

      <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-700">
        <Sec365Logo caption="Parceria" className="h-6" />
      </div>
    </aside>
  );
}
