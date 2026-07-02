import { TaskStatus } from "@/generated/prisma/client";
import {
  apiError,
  apiOk,
  errorMessage,
  firstZodIssue,
  readJsonBody,
  requireApiUser,
} from "@/lib/api-route";
import { prisma } from "@/lib/prisma";
import { revalidateTaskViews } from "@/lib/revalidate";
import { taskUpdateSchema } from "@/lib/validators";

async function resolveProjectId(userId: string, projectId: string | null) {
  if (!projectId) {
    return null;
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  });

  return project?.id ?? null;
}

async function resolveAssigneeId(userId: string, assigneeId: string | null) {
  if (!assigneeId) {
    return null;
  }

  const member = await prisma.member.findFirst({
    where: { id: assigneeId, userId },
    select: { id: true },
  });

  return member?.id ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireApiUser();
  if (user instanceof Response) {
    return user;
  }

  try {
    const { id } = await params;
    const task = await prisma.task.findFirst({
      where: { id, userId: user.id },
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
    });

    if (!task) {
      return apiError(404, "Tache introuvable.");
    }

    return apiOk(task);
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireApiUser();
  if (user instanceof Response) {
    return user;
  }

  let input: unknown;
  try {
    input = await readJsonBody(request);
  } catch (error) {
    return apiError(400, errorMessage(error));
  }

  const payload = typeof input === "object" && input !== null ? input : {};
  const { id } = await params;
  const parsed = taskUpdateSchema.safeParse({ ...payload, id });
  if (!parsed.success) {
    return apiError(400, firstZodIssue(parsed.error));
  }

  try {
    const data = parsed.data;
    const existing = await prisma.task.findFirst({
      where: { id: data.id, userId: user.id },
    });

    if (!existing) {
      return apiError(404, "Tache introuvable.");
    }

    const nextStatus = data.status ?? existing.status;
    let completedAt = existing.completedAt;
    if (data.status && data.status !== existing.status) {
      completedAt = data.status === TaskStatus.DONE ? new Date() : null;
    }

    const projectId =
      data.projectId === undefined
        ? existing.projectId
        : await resolveProjectId(user.id, data.projectId);
    const assigneeId =
      data.assigneeId === undefined
        ? existing.assigneeId
        : await resolveAssigneeId(user.id, data.assigneeId);

    const updated = await prisma.task.update({
      where: { id: existing.id },
      data: {
        title: data.title ?? existing.title,
        description:
          data.description === undefined
            ? existing.description
            : data.description,
        status: nextStatus,
        priority: data.priority ?? existing.priority,
        dueDate: data.dueDate === undefined ? existing.dueDate : data.dueDate,
        projectId,
        assigneeId,
        completedAt,
      },
      include: {
        project: true,
        assignee: true,
      },
    });

    revalidateTaskViews();
    return apiOk(updated);
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireApiUser();
  if (user instanceof Response) {
    return user;
  }

  try {
    const { id } = await params;
    const deleted = await prisma.task.deleteMany({
      where: { id, userId: user.id },
    });

    if (deleted.count === 0) {
      return apiError(404, "Tache introuvable.");
    }

    revalidateTaskViews();
    return apiOk({ id });
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
