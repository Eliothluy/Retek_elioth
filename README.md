<div align="center">

# 🍅 RetekGPT

### Plataforma de gestão de tarefas com rede social para equipes de desenvolvimento

Feed social · Gamificação · Ranking · Notificações em tempo real · Modo Pomodoro

[![Node](https://img.shields.io/badge/Node-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

</div>

---

## 📖 Sobre

**RetekGPT** é uma plataforma de gestão de tarefas voltada para equipes de desenvolvimento que combina a leveza de um "Facebook interno" com a produtividade de ferramentas como Jira e GitHub Projects. O foco é **aumentar o engajamento** sem ser estressante — através de feed social, gamificação leve (pontos, badges, ranking), notificações em tempo real e um modo Pomodoro integrado.

### ✨ Destaques

- 📋 **CRUD de tarefas** com módulo, projeto, responsável, datas, prioridade, alertas e detecção automática de atraso
- 📰 **Feed social** com curtidas, comentários e atividades em tempo real (estilo Facebook)
- 🔔 **Notificações em tempo real** via WebSocket (Socket.io + Redis pub/sub)
- 🏆 **Ranking de desenvolvedores** em 4 categorias: Performance, Concluídas, Atrasos, Atividades
- 🍅 **Modo Pomodoro** integrado ao iniciar uma tarefa — timer circular, pausas automáticas, widget flutuante
- 🎮 **Gamificação** — pontos por conclusão (bônus no prazo, penalidade por atraso), badges, níveis
- 🎨 **UX leve e relaxante** — cores suaves (azul `#3B82F6`, verde `#22C55E`), microinterações, sem excesso de vermelho
- 📱 **Responsivo** — funciona em desktop, tablet e mobile

---

## 🛠️ Stack tecnológica

| Camada        | Tecnologias                                                              |
| ------------- | ------------------------------------------------------------------------ |
| **Frontend**  | Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, ShadCN-style |
| **Estado**    | Zustand (auth/UI/Pomodoro), TanStack Query (cache de servidor)           |
| **Backend**   | NestJS 10, TypeScript                                                    |
| **ORM/DB**    | Prisma + PostgreSQL                                                      |
| **Cache/RT**  | Redis (ioredis) + Socket.io                                              |
| **Auth**      | JWT (access 15m) + refresh tokens com rotação e revogação                |
| **Monorepo**  | pnpm workspaces + Turborepo                                              |
| **Infra**     | Docker + Docker Compose, GitHub Actions (CI)                             |

---

## 🚀 Quick start

### Opção A — Docker Compose (recomendado)

```bash
git clone https://github.com/Eliothluy/Retek_elioth.git
cd Retek_elioth
cp .env.example .env
docker compose -f docker/docker-compose.yml up -d --build
```

Acesse:

| Serviço    | URL                          |
| ---------- | ---------------------------- |
| Frontend   | http://localhost:3000        |
| API        | http://localhost:4000/api    |
| Health     | http://localhost:4000/health |

O backend executa `prisma migrate deploy` + `seed` automaticamente na primeira inicialização.

### Opção B — Desenvolvimento nativo

```bash
# 1. Pré-requisitos: Node 20+, pnpm 9+, Docker (para Postgres/Redis)
corepack enable && corepack prepare pnpm@9.12.0 --activate

# 2. Clone e instale
git clone https://github.com/Eliothluy/Retek_elioth.git
cd Retek_elioth
pnpm install

# 3. Suba Postgres e Redis
docker compose -f docker/docker-compose.yml up -d postgres redis

# 4. Configure as variáveis de ambiente
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 5. Banco de dados (migrate + seed)
pnpm db:migrate
pnpm db:seed

# 6. Rode em modo dev (frontend + backend em paralelo)
pnpm dev
```

### 🔑 Credenciais de demo

| Perfil   | Email                     | Senha         |
| -------- | ------------------------- | ------------- |
| Admin    | `admin@retekgpt.dev`      | `password123` |
| Dev 1    | `dev1@retekgpt.dev`       | `password123` |
| Dev 2    | `dev2@retekgpt.dev`       | `password123` |
| Dev 3    | `dev3@retekgpt.dev`       | `password123` |
| Manager  | `manager@retekgpt.dev`    | `password123` |

---

## 📂 Estrutura do projeto

```
RetekGPT/
├── apps/
│   ├── frontend/              # Next.js 14 (App Router)
│   │   ├── src/
│   │   │   ├── app/           # Rotas (auth, dashboard, tasks, feed, ranking, etc.)
│   │   │   ├── components/    # Sidebar, Topbar, TaskCard, FeedItem, PomodoroTimer, ...
│   │   │   ├── hooks/         # use-tasks, use-feed, use-notifications, use-ranking
│   │   │   ├── lib/           # api client, socket, utils, constants
│   │   │   ├── stores/        # Zustand: auth-store, pomodoro-store
│   │   │   └── types/         # Tipos compartilhados TypeScript
│   │   └── public/
│   │
│   └── backend/               # NestJS
│       ├── prisma/
│       │   ├── schema.prisma  # Modelos: User, Task, Project, Notification, ...
│       │   ├── seed.ts        # Dados de demonstração
│       │   └── migrations/    # Migrations SQL
│       └── src/
│           ├── modules/       # auth, users, tasks, projects, feed, notifications, ranking
│           ├── realtime/      # Gateway Socket.io + Redis pub/sub
│           └── common/        # prisma, redis, guards, decorators, filters
│
├── packages/
│   ├── ui/                    # Design system compartilhado (Button, Card, Badge, ...)
│   └── config/               # Presets de tsconfig (base, next, nest)
│
├── docker/
│   └── docker-compose.yml     # Postgres + Redis + backend + frontend
│
├── .github/workflows/ci.yml   # CI: typecheck, lint, build, docker
├── agents.md                  # Documentação técnica para engenharia
└── package.json               # Scripts do monorepo (Turborepo)
```

---

## 🍅 Modo Pomodoro

Ao clicar **"Iniciar com Pomodoro 🍅"** em uma tarefa:

1. A tarefa muda para **Em andamento** e o modal do timer abre
2. Ciclo padrão: **25min foco** → **5min pausa** → **15min pausa longa** (a cada 4 sessões)
3. Ao minimizar o modal, um **widget flutuante** aparece no canto inferior direito — o timer continua rodando em background
4. A cada sessão de foco concluída:
   - O tempo é registrado na tarefa (`timeSpentMinutes`)
   - O contador de sessões é incrementado (`pomodoroSessions`)
   - **Pontos de bônus** são concedidos ao responsável (+1 por 5 min de foco)
   - Uma notificação de parabéns é enviada em tempo real
5. A página de detalhes da tarefa exibe o total de sessões e tempo de foco

---

## 🏆 Ranking & Gamificação

### Pontuação por conclusão de tarefa

| Prioridade | Pontos base | Bônus no prazo | Penalidade atraso |
| ---------- | ----------- | -------------- | ----------------- |
| Alta       | 30          | +15            | −50%              |
| Média      | 20          | +15            | −50%              |
| Baixa      | 10          | +15            | −50%              |

### Categorias de ranking

| Categoria       | Ícone | Critério                                    |
| --------------- | ----- | ------------------------------------------- |
| Performance     | 🏆    | Pontos + entregas no prazo − atrasos        |
| Concluídas      | ✅    | Maior número de tarefas concluídas          |
| Atrasos         | ⚠️    | Tarefas que passaram do prazo               |
| Atividades      | 📊    | Maior engajamento no feed                   |

---

## 📋 Funcionalidades

### Gestão de tarefas

Campos: título, descrição, módulo, projeto, responsável, data de início, data de fim, data de conclusão, status, prioridade, alerta e atraso (automático).

| Status         | Descrição                          |
| -------------- | ---------------------------------- |
| Pendente       | Ainda não iniciada                 |
| Em andamento   | Sendo trabalhada                   |
| Concluído      | Finalizada                         |
| Atrasado       | Passou do prazo (auto-detectado)   |

### Sidebar

**Menu Principal:** Dashboard, Feed, Tarefas, Projetos, Ranking, Notificações

**Menu Empresa:** Empresa, Alertas (com badge), Lembretes, Ideias, Licenças, Parcerias, Tarefas, Projetos, Despesas

**Menu Negócios:** Negócios, Licitações, Análise, Empresas, Competitiva, Clientes, Usuários

### Detecção automática de atraso

- Cron job a cada hora marca tarefas vencidas como `LATE`
- Cron job a cada 6h envia alertas de prazo próximo (<24h) com dedup via Redis

---

## 🔌 API endpoints

### Autenticação

| Método | Rota              | Descrição                          |
| ------ | ----------------- | ---------------------------------- |
| POST   | `/auth/register`  | Registrar novo usuário             |
| POST   | `/auth/login`     | Login (retorna access + refresh)   |
| POST   | `/auth/refresh`   | Renovar access token               |
| POST   | `/auth/logout`    | Revogar refresh token              |
| GET    | `/auth/me`        | Dados do usuário autenticado       |

### Tarefas

| Método | Rota                     | Descrição                              |
| ------ | ------------------------ | -------------------------------------- |
| GET    | `/tasks`                 | Listar (filtros: status, assignee, project) |
| GET    | `/tasks/:id`             | Detalhe de uma tarefa                  |
| POST   | `/tasks`                 | Criar tarefa                           |
| PATCH  | `/tasks/:id`             | Atualizar tarefa                       |
| PATCH  | `/tasks/:id/status`      | Mudar status (gamificação aplicada)    |
| POST   | `/tasks/:id/pomodoro`    | Registrar sessão Pomodoro concluída    |
| DELETE | `/tasks/:id`             | Remover tarefa                         |

### Feed · Notificações · Ranking · Projetos · Usuários

| Método | Rota                              | Descrição                       |
| ------ | --------------------------------- | ------------------------------- |
| GET    | `/feed`                           | Listar atividades (cursor pagination) |
| POST   | `/feed/like/:activityId`          | Curtir/descurtir                |
| POST   | `/feed/comment`                   | Comentar                        |
| GET    | `/notifications`                  | Listar notificações             |
| GET    | `/notifications/unread-count`     | Contagem de não lidas           |
| PATCH  | `/notifications/read`             | Marcar como lidas               |
| POST   | `/notifications/read-all`         | Marcar todas como lidas         |
| GET    | `/ranking`                        | Todos os rankings               |
| GET    | `/ranking/:category`              | Ranking por categoria           |
| GET    | `/projects`                       | Listar projetos                 |
| POST   | `/projects`                       | Criar projeto                   |
| GET    | `/users`                          | Listar usuários                 |
| PATCH  | `/users/me`                       | Atualizar perfil                |

> WebSocket: `ws://localhost:4000/realtime` (autenticado via JWT em `handshake.auth.token`)

---

## 📜 Scripts

| Comando                | Ação                                            |
| ---------------------- | ----------------------------------------------- |
| `pnpm dev`             | Sobe frontend + backend em paralelo (hot reload)|
| `pnpm build`           | Build de produção de todos os apps              |
| `pnpm start`           | Inicia servidores em modo produção              |
| `pnpm typecheck`       | Checagem de tipos (todos os pacotes)            |
| `pnpm lint`            | Lint de todos os pacotes                        |
| `pnpm test`            | Roda os testes                                  |
| `pnpm db:migrate`      | Cria/aplica migrations (dev)                    |
| `pnpm db:seed`         | Popula o banco com dados demo                   |
| `pnpm db:studio`       | Abre o Prisma Studio                            |
| `pnpm docker:up`       | Sobe toda a stack via Docker Compose            |
| `pnpm docker:down`     | Derruba a stack Docker                          |
| `pnpm clean`           | Limpa node_modules e caches                     |

---

## 🎨 Design system

| Token          | Cor       | Uso                       |
| -------------- | --------- | ------------------------- |
| `brand-600`    | `#3B82F6` | Primário, ações, links    |
| `success-500`  | `#22C55E` | Concluído, sucesso        |
| `neutral-50`   | `#F9FAFB` | Fundo                     |
| `neutral-900`  | `#111827` | Texto principal           |

Componentes compartilhados em `packages/ui`: Button, Card, Badge, Input, Textarea, Select, Avatar, Skeleton.

---

## 🚢 Deploy

### Frontend (Vercel)

1. Importar o repositório, root directory = `apps/frontend`
2. Build: `cd ../.. && pnpm install && pnpm --filter @retekgpt/frontend build`
3. Variáveis: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`

### Backend (Railway / Render / AWS ECS)

1. Usar a imagem Docker (`apps/backend/Dockerfile`)
2. Provisionar PostgreSQL + Redis gerenciados
3. Variáveis: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`
4. Release command: `npx prisma migrate deploy`

### CI/CD

O workflow `.github/workflows/ci.yml` executa em push/PR: install → prisma generate → typecheck → lint → build → build das imagens Docker.

---

## 📚 Documentação

- [**agents.md**](./agents.md) — Documentação técnica completa (arquitetura, fluxo de dados, escala, deploy)

---

## 📄 Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE) para mais detalhes.

---

<div align="center">

Feito com 💙 para equipes de desenvolvimento que merecem uma gestão de tarefas mais humana.

</div>
