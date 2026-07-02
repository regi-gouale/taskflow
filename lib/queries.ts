import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Prisma, TaskPriority } from "@/generated/prisma/client";
import { TaskStatus } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return (session?.user as SessionUser | undefined) ?? null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    project: true;
    assignee: true;
    comments: {
      include: {
        author: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
  };
}>;

export type TaskFilters = {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
};

export async function getTasks(userId: string, filters: TaskFilters = {}) {
  return prisma.task.findMany({
    where: {
      userId,
      projectId: filters.projectId,
      assigneeId: filters.assigneeId,
      status: filters.status,
      priority: filters.priority,
      title: filters.search
        ? { contains: filters.search, mode: "insensitive" }
        : undefined,
    },
    include: {
      project: true,
      assignee: true,
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
}

export async function getProjectsWithProgress(userId: string) {
  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      tasks: { select: { id: true, status: true, assigneeId: true } },
    },
  });

  return projects.map((project) => {
    const total = project.tasks.length;
    const done = project.tasks.filter(
      (task) => task.status === TaskStatus.DONE
    ).length;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      status: project.status,
      createdAt: project.createdAt,
      taskCount: total,
      doneCount: done,
      progress,
    };
  });
}

export type ProjectWithProgress = Awaited<
  ReturnType<typeof getProjectsWithProgress>
>[number];

export async function getMembers(userId: string) {
  return prisma.member.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { tasks: true } } },
  });
}

export type MemberWithCount = Awaited<ReturnType<typeof getMembers>>[number];

export async function getDashboardData(userId: string) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [active, completedWeek, overdue, total, done, recentTasks, projects] =
    await Promise.all([
      prisma.task.count({
        where: { userId, status: { not: TaskStatus.DONE } },
      }),
      prisma.task.count({
        where: {
          userId,
          status: TaskStatus.DONE,
          completedAt: { gte: weekAgo },
        },
      }),
      prisma.task.count({
        where: {
          userId,
          status: { not: TaskStatus.DONE },
          dueDate: { lt: now },
        },
      }),
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: TaskStatus.DONE } }),
      prisma.task.findMany({
        where: { userId },
        include: {
          project: true,
          assignee: true,
          comments: {
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      getProjectsWithProgress(userId),
    ]);

  const productivity = total === 0 ? 0 : Math.round((done / total) * 100);

  return {
    stats: { active, completedWeek, overdue, productivity },
    recentTasks,
    projects: projects.slice(0, 4),
  };
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  IN_REVIEW: "En revue",
  DONE: "Terminé",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

export async function getReportStats(userId: string) {
  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const [tasks, projects] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      select: {
        status: true,
        priority: true,
        completedAt: true,
        dueDate: true,
      },
    }),
    getProjectsWithProgress(userId),
  ]);

  const byStatus = (Object.keys(STATUS_LABELS) as TaskStatus[]).map(
    (status) => ({
      status,
      label: STATUS_LABELS[status],
      count: tasks.filter((task) => task.status === status).length,
    })
  );

  const byPriority = (Object.keys(PRIORITY_LABELS) as TaskPriority[]).map(
    (priority) => ({
      priority,
      label: PRIORITY_LABELS[priority],
      count: tasks.filter((task) => task.priority === priority).length,
    })
  );

  const completions: { date: string; label: string; count: number }[] = [];
  for (let index = 0; index < 14; index += 1) {
    const day = new Date(since);
    day.setDate(since.getDate() + index);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const count = tasks.filter(
      (task) =>
        task.completedAt && task.completedAt >= day && task.completedAt < next
    ).length;
    completions.push({
      date: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      count,
    });
  }

  const total = tasks.length;
  const done = tasks.filter((task) => task.status === TaskStatus.DONE).length;
  const inProgress = tasks.filter(
    (task) => task.status === TaskStatus.IN_PROGRESS
  ).length;
  const overdue = tasks.filter(
    (task) =>
      task.status !== TaskStatus.DONE &&
      task.dueDate !== null &&
      task.dueDate < now
  ).length;
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

  return {
    byStatus,
    byPriority,
    completions,
    projects,
    totals: { total, done, inProgress, overdue, completionRate },
  };
}

export async function getCalendarTasks(userId: string) {
  return prisma.task.findMany({
    where: { userId, dueDate: { not: null } },
    include: {
      project: true,
      assignee: true,
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  });
}
