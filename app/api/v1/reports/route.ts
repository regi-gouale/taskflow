import type { TaskPriority } from "@/generated/prisma/client";
import { TaskStatus } from "@/generated/prisma/client";
import { apiError, apiOk, errorMessage, requireApiUser } from "@/lib/api-route";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "A faire",
  IN_PROGRESS: "En cours",
  IN_REVIEW: "En revue",
  DONE: "Termine",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof Response) {
    return user;
  }

  try {
    const now = new Date();
    const since = new Date(now);
    since.setDate(now.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    const [tasks, projects] = await Promise.all([
      prisma.task.findMany({
        where: { userId: user.id },
        select: {
          status: true,
          priority: true,
          completedAt: true,
          dueDate: true,
        },
      }),
      prisma.project.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          tasks: { select: { id: true, status: true } },
        },
      }),
    ]);

    const byStatus = (Object.keys(STATUS_LABELS) as TaskStatus[]).map(
      (status) => ({
        status,
        label: STATUS_LABELS[status],
        count: tasks.filter((task) => task.status === status).length,
      })
    );

    const byPriority = (
      Object.keys(PRIORITY_LABELS) as Array<keyof typeof PRIORITY_LABELS>
    ).map((priority) => ({
      priority,
      label: PRIORITY_LABELS[priority],
      count: tasks.filter((task) => task.priority === priority).length,
    }));

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

    const projectSummaries = projects.map((project) => {
      const taskCount = project.tasks.length;
      const doneCount = project.tasks.filter(
        (task) => task.status === TaskStatus.DONE
      ).length;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        createdAt: project.createdAt,
        taskCount,
        doneCount,
        progress:
          taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100),
      };
    });

    return apiOk({
      byStatus,
      byPriority,
      completions,
      projects: projectSummaries,
      totals: { total, done, inProgress, overdue, completionRate },
    });
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
