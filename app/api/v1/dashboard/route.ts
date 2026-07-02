import { TaskStatus } from "@/generated/prisma/client";
import { apiError, apiOk, errorMessage, requireApiUser } from "@/lib/api-route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof Response) {
    return user;
  }

  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [active, completedWeek, overdue, total, done, recentTasks, projects] =
      await Promise.all([
        prisma.task.count({
          where: { userId: user.id, status: { not: TaskStatus.DONE } },
        }),
        prisma.task.count({
          where: {
            userId: user.id,
            status: TaskStatus.DONE,
            completedAt: { gte: weekAgo },
          },
        }),
        prisma.task.count({
          where: {
            userId: user.id,
            status: { not: TaskStatus.DONE },
            dueDate: { lt: now },
          },
        }),
        prisma.task.count({ where: { userId: user.id } }),
        prisma.task.count({
          where: { userId: user.id, status: TaskStatus.DONE },
        }),
        prisma.task.findMany({
          where: { userId: user.id },
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
        prisma.project.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          include: {
            tasks: { select: { id: true, status: true, assigneeId: true } },
          },
        }),
      ]);

    const productivity = total === 0 ? 0 : Math.round((done / total) * 100);
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
      stats: { active, completedWeek, overdue, productivity },
      recentTasks,
      projects: projectSummaries.slice(0, 4),
    });
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
