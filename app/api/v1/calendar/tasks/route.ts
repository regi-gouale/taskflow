import { apiError, apiOk, errorMessage, requireApiUser } from "@/lib/api-route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof Response) {
    return user;
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: user.id, dueDate: { not: null } },
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

    return apiOk(tasks);
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
