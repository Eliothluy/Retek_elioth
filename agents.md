# agents.md — Retek

> Documentação técnica de referência para agentes de engenharia (humanos e IA) que trabalham neste repositório.

## 1. Visão geral

**Retek** é uma plataforma de **gestão de tarefas com características de rede social**, voltada para equipes de desenvolvimento. O objetivo é aumentar o engajamento e a conclusão de tarefas por meio de um feed social, gamificação (pontos, badges, ranking), notificações em tempo real e uma UX leve e agradável — um "Facebook interno" para times de software.

Comparável a: GitHub Projects + Jira (mais leve) + Facebook (UX).

### Pilares do produto

1. **Gestão de tarefas** — CRUD completo com módulo, projeto, responsável, datas, status, prioridade, alertas e detecção automática de atraso.
2. **Feed social** — atividades (criação/conclusão/atualização de tarefas) com curtidas e comentários.
3. **Notificações em tempo real** — via WebSocket (Socket.io) + Redis pub/sub.
4. **Ranking de desenvolvedores** — 4 categorias: Performance, Concluídas, Atrasos, Atividades.
5. **Gamificação leve** — pontos por conclusão (com bônus por entrega antecipada/no prazo e penalidade por atraso), badges e progresso.

## 2. Stack técnica

| Camada        | Tecnologia                                                            |
| ------------- | --------------------------------------------------------------------- |
| Frontend      | Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, ShadCN-style UI |
| State         | Zustand (auth/UI), TanStack Query (server cache)                      |
| Backend       | NestJS 10, TypeScript                                                 |
| ORM / DB      | Prisma + PostgreSQL                                                   |
| Cache / RT    | Redis (ioredis) + Socket.io                                           |
| Auth          | JWT (access 15m) + refresh tokens com rotação (revogáveis no banco)   |
| Monorepo      | pnpm workspaces + Turborepo                                           |
| Infra         | Docker + Docker Compose, GitHub Actions (CI)                          |

## 3. Arquitetura

```
Retek/
├── apps/
│   ├── frontend/   # Next.js 14 (App Router) — UI, estado, socket client
│   └── backend/    # NestJS — API REST + gateway WebSocket
├── packages/
│   ├── ui/         # Design system compartilhado (Button, Card, Badge, ...)
│   └── config/     # tsconfig presets (base, next, nest)
└── docker/
    └── docker-compose.yml
```

### Backend (NestJS) — módulos

- `AuthModule` — registro, login, refresh, logout, `me`. Estratégia JWT (Passport).
- `UsersModule` — perfil, listagem, atribuição de pontos.
- `ProjectsModule` — CRUD de projetos + membros.
- `TasksModule` — CRUD de tarefas, mudança de status, gamificação, **cron jobs** para detecção de atraso e alertas de prazo.
- `FeedModule` — atividades, curtidas (toggle), comentários.
- `NotificationsModule` — notificações CRUD + contagem de não lidas.
- `RankingModule` — leaderboards ao vivo + snapshot diário.
- `RealtimeModule` (global) — gateway Socket.io autenticado por JWT + Redis pub/sub.
- `PrismaModule` / `RedisModule` (globais) — conexões compartilhadas.

### Frontend (Next.js) — estrutura

- `(auth)/` — login e register (layout split-screen).
- `(app)/` — área autenticada com `Sidebar` (menus Empresa + Negócios) e `Topbar` (busca, pontos, sino de notificações, menu de usuário).
- `AuthGuard` protege a área autenticada (redirect para `/login` quando sem token).
- Hooks por domínio (`use-tasks`, `use-feed`, `use-notifications`, `use-ranking`, `use-misc`) encapsulam TanStack Query.
- `lib/socket.ts` mantém uma única conexão Socket.io autenticada.

## 4. Modelo de dados (Prisma)

Models principais: `User`, `RefreshToken`, `Project`, `ProjectMember`, `Task`, `ActivityFeed`, `Like`, `Comment`, `Notification`, `Ranking`.

- `Task.status`: `PENDING | IN_PROGRESS | COMPLETED | LATE`
- `Task.isLate`: boolean **automático** (calculado no create/update e por cron).
- `ActivityFeed.type`: `TASK_CREATED | TASK_UPDATED | TASK_COMPLETED | TASK_LATE | ...`
- `Ranking`: snapshot por `(userId, category, period)` com índice composto para consultas rápidas.

Schema: `apps/backend/prisma/schema.prisma`.

## 5. Fluxo de dados

### Criação/conclusão de tarefa (exemplo de fluxo completo)

1. Cliente faz `POST /api/tasks` com JWT → `TasksService.create`.
2. Cria a `Task`, calcula `isLate`, cria um `ActivityFeed` (TASK_CREATED).
3. `RealtimeService.broadcastFeedItem` publica no canal Redis `feed` → gateway emite `feed:new` a todos os clientes conectados.
4. Se houver `assigneeId` ≠ criador, `NotificationsService.create` cria a notificação e publica no canal `notifications` → gateway emite `notification` ao room `user:<id>`.
5. Frontend recebe via socket e invalida as queries do TanStack Query (feed/notificações atualizam instantaneamente).

### Conclusão de tarefa (gamificação)

1. `PATCH /api/tasks/:id/status` com `COMPLETED` → `TasksService.updateStatus`.
2. Define `completedAt`, zera `isLate`, **calcula pontos** (`computeCompletionPoints`):
   - Base por prioridade: Alta 30, Média 20, Baixa 10.
   - **-50%** se atrasada.
   - **+15** bônus se entregue dentro do prazo planejado.
3. Incrementa `User.points`, cria `ActivityFeed` (TASK_COMPLETED) e notificação de parabéns.
4. Ranking (cacheado no Redis) é invalidado e refeito na próxima leitura.

### Detecção automática de atraso

- Cron `EVERY_HOUR` (`detectLateTasks`): marca `isLate=true`, `status=LATE`, gera atividade + notificação.
- Cron `EVERY_6_HOURS` (`deadlineApproachingAlerts`): notifica responsáveis de tarefas com alerta ativo vencendo em <24h (com dedup via Redis).

## 6. Como rodar localmente

### Pré-requisitos

- Node 20+, pnpm 9+, Docker (opcional para Postgres/Redis).

### Opção A — Docker Compose (recomendado)

```bash
cp .env.example .env
docker compose -f docker/docker-compose.yml up -d --build
# backend roda migrate + seed automaticamente
# Frontend: http://localhost:3000 · API: http://localhost:4000/api
```

### Opção B — Desenvolvimento nativo

```bash
# 1. Suba Postgres e Redis (ou use os do docker-compose)
docker compose -f docker/docker-compose.yml up -d postgres redis

# 2. Instale dependências
pnpm install

# 3. Configure env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 4. Banco
pnpm --filter @retekapp/backend exec prisma migrate dev
pnpm --filter @retekapp/backend exec prisma db seed

# 5. Rode tudo em paralelo
pnpm dev
```

### Credenciais de demo (seed)

- `dev1@retek.dev` / `password123`
- `admin@retek.dev` / `password123`

## 7. Como escalar

- **API**: NestJS é stateless → escala horizontal atrás de um load balancer. As conexões Socket.io devem usar o adaptador Redis (`@socket.io/redis-adapter`) ao rodar múltiplas instâncias (atualmente pub/sub via Redis já prepara o caminho).
- **Banco**: índices já definidos nos campos mais consultados (`status`, `isLate`, `assigneeId`, `createdAt`, índice composto de Ranking). Para escala maior, adicione read replicas e particionamento por `projectId`.
- **Cache**: ranking e listas de usuários/projetos são cacheados no Redis (TTL 60–120s). Aumente a granularidade do cache conforme o tráfego.
- **Filas**: para alta carga, mova notificações e snapshots de ranking para um queue (BullMQ) em vez de executar síncrono/cron.
- **Frontend**: Next.js no Vercel com ISR/edge onde aplicável; TanStack Query reduz chamadas duplicadas.

## 8. Estratégia de deploy

### Frontend (Vercel)

1. Importar o repositório, root = `apps/frontend`.
2. Build command: `cd ../.. && pnpm install && pnpm --filter @retekapp/frontend build`.
3. Variáveis: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL` apontando para a API pública.

### Backend (Railway / Render / AWS ECS)

1. Usar a imagem Docker (`apps/backend/Dockerfile`).
2. Provisionar PostgreSQL gerenciado + Redis gerenciado.
3. Variáveis de ambiente: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`.
4. Release command: `npx prisma migrate deploy` (seed apenas no primeiro deploy).

### CI/CD

`.github/workflows/ci.yml` executa em push/PR: install → prisma generate → typecheck → lint → build → build das imagens Docker (em push para main).

## 9. Scripts úteis

| Comando                      | Ação                                  |
| ---------------------------- | ------------------------------------- |
| `pnpm dev`                   | Sobe frontend + backend em paralelo   |
| `pnpm build`                 | Build de produção de todos os apps    |
| `pnpm typecheck`             | Checagem de tipos                     |
| `pnpm db:migrate`            | Cria/aplica migrations (dev)          |
| `pnpm db:seed`               | Popula o banco com dados demo         |
| `pnpm db:studio`             | Prisma Studio                         |
| `pnpm docker:up` / `:down`   | Sobe/derruba toda a stack via Docker  |

## 10. Convenções

- **TypeScript estrito** em todo o monorepo (`noUncheckedIndexedAccess`, `strict`).
- **Clean Code**: serviços por domínio, DTOs com `class-validator`, guards/decorators reutilizáveis.
- **Sem comentários desnecessários** no código; a documentação vive aqui e nos commits.
- **Design system**: cores suaves (`brand` azul `#3B82F6`, `success` verde `#22C55E`, fundo `#F9FAFB`), microinterações (hover, `animate-*`), evitando excesso de vermelho.
- **Segurança**: senhas com bcrypt (cost 12), refresh tokens revogáveis, helmet, CORS restrito ao frontend, validação de env no boot.

## 11. Próximos passos / extensões

- Adaptador Redis para Socket.io (`@socket.io/redis-adapter`) ao escalar instâncias.
- OAuth Google/GitHub (estratégias já esboçadas em `auth.service.validateOAuthUser`).
- BullMQ para filas de notificação/email.
- Badges automáticos baseados em marcos de pontos.
- PWA + push notifications nativas (Web Push).
