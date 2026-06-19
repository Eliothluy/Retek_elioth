import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "RetekGPT — Gestão de Tarefas para Devs",
    template: "%s · RetekGPT",
  },
  description:
    "Plataforma social de gestão de tarefas para equipes de desenvolvimento. Engajamento, gamificação e produtividade em um só lugar.",
  keywords: ["gestão de tarefas", "desenvolvedores", "produtividade", "gamificação", "feed social"],
  authors: [{ name: "RetekGPT" }],
  openGraph: {
    title: "RetekGPT — Gestão de Tarefas para Devs",
    description: "Plataforma social de gestão de tarefas para equipes de desenvolvimento.",
    type: "website",
    locale: "pt_BR",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('retek-theme');if(t&&t.includes('"dark"')){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
