import { PrismaClient, TaskPriority, TaskStatus, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Retek database...");

  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@retek.dev" },
    update: {},
    create: {
      email: "admin@retek.dev",
      name: "Ana Admin",
      title: "Engineering Lead",
      role: UserRole.ADMIN,
      password,
      points: 420,
      badges: JSON.stringify(["🚀 Launch", "🏆 Top Performer"]),
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@retek.dev" },
    update: {},
    create: {
      email: "manager@retek.dev",
      name: "Marcos Manager",
      title: "Project Manager",
      role: UserRole.MANAGER,
      password,
      points: 310,
      badges: JSON.stringify(["📋 Organizer"]),
    },
  });

  const devs = await Promise.all(
    [
      { name: "Carla Dev", title: "Senior Frontend Engineer", points: 540 },
      { name: "Bruno Dev", title: "Backend Engineer", points: 280 },
      { name: "Diana Dev", title: "Fullstack Engineer", points: 195 },
    ].map((d, i) =>
      prisma.user.upsert({
        where: { email: `dev${i + 1}@retek.dev` },
        update: {},
        create: {
          email: `dev${i + 1}@retek.dev`,
          name: d.name,
          title: d.title,
          role: UserRole.DEVELOPER,
          password,
          points: d.points,
        },
      })
    )
  );

  const allUsers = [admin, manager, ...devs];

  const carla = devs[0]!;
  const bruno = devs[1]!;
  const diana = devs[2]!;

  const project = await prisma.project.upsert({
    where: { id: "seed-project-1" },
    update: {},
    create: {
      id: "seed-project-1",
      name: "Retek Platform",
      description: "Plataforma social de gestão de tarefas",
      color: "#3B82F6",
      ownerId: admin.id,
      members: { create: allUsers.map((u) => ({ userId: u.id })) },
    },
  });

  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 86400000);

  const tasks = [
    { title: "Configurar autenticação JWT", module: "auth", assignee: carla, start: -7, end: -5, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, completedAt: days(-5) },
    { title: "Modelar schema Prisma", module: "db", assignee: bruno, start: -7, end: -6, status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, completedAt: days(-6) },
    { title: "Feed social em tempo real", module: "feed", assignee: carla, start: -3, end: 2, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM },
    { title: "Ranking de desenvolvedores", module: "ranking", assignee: diana, start: -2, end: 3, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM },
    { title: "Notificações WebSocket", module: "realtime", assignee: bruno, start: -4, end: -1, status: TaskStatus.LATE, priority: TaskPriority.HIGH, isLate: true },
    { title: "Design system + sidebar", module: "ui", assignee: diana, start: 0, end: 5, status: TaskStatus.PENDING, priority: TaskPriority.LOW },
    { title: "Docker compose + CI", module: "infra", assignee: manager, start: 1, end: 6, status: TaskStatus.PENDING, priority: TaskPriority.MEDIUM },
  ];

  for (const t of tasks) {
    const created = await prisma.task.create({
      data: {
        title: t.title,
        module: t.module,
        projectId: project.id,
        assigneeId: t.assignee.id,
        createdById: manager.id,
        startDate: days(t.start),
        endDate: days(t.end),
        completedAt: t.completedAt ?? null,
        status: t.status,
        priority: t.priority,
        isLate: t.isLate ?? false,
      },
    });

    if (t.status === TaskStatus.COMPLETED) {
      await prisma.activityFeed.create({
        data: {
          type: "TASK_COMPLETED",
          actorId: t.assignee.id,
          taskId: created.id,
          projectId: project.id,
          metadata: JSON.stringify({ title: t.title, points: 25 }),
        },
      });
    } else {
      await prisma.activityFeed.create({
        data: {
          type: "TASK_CREATED",
          actorId: manager.id,
          taskId: created.id,
          projectId: project.id,
          metadata: JSON.stringify({ title: t.title }),
        },
      });
    }
  }

  // Seed notifications
  await prisma.notification.createMany({
    data: [
      { userId: carla.id, type: "TASK_ASSIGNED", title: "Nova tarefa atribuída", message: "Feed social em tempo real" },
      { userId: bruno.id, type: "TASK_LATE", title: "Tarefa atrasada", message: "Notificações WebSocket passou do prazo" },
      { userId: carla.id, type: "RANK_UPDATE", title: "Subiu no ranking!", message: "Você é o #1 em Performance" },
      { userId: manager.id, type: "SYSTEM", title: "Bem-vindo ao Retek", message: "Plataforma pronta para uso" },
    ],
  });

  console.log(`✅ Seeded ${allUsers.length} users, 1 project, ${tasks.length} tasks, notifications`);
  console.log("   Demo login: dev1@retek.dev / password123");
  console.log("   Admin login: admin@retek.dev / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
