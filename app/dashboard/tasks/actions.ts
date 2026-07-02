"use server";

import { TaskStatus } from "@/generated/prisma/client";
import {
  type ActionResult,
  firstZodError,
  toActionError,
} from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/queries";
import { revalidateTaskViews } from "@/lib/revalidate";
import {
  taskBoardReorderSchema,
  taskCommentCreateSchema,
  taskCreateSchema,
  taskToggleSchema,
  taskUpdateSchema,
} from "@/lib/validators";

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

export async function createTask(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = taskCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    const data = parsed.data;
    const [last, projectId, assigneeId] = await Promise.all([
      prisma.task.findFirst({
        where: { userId: user.id, status: data.status },
        orderBy: { position: "desc" },
        select: { position: true },
      }),
      resolveProjectId(user.id, data.projectId),
      resolveAssigneeId(user.id, data.assigneeId),
    ]);

    await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        projectId,
        assigneeId,
        position: (last?.position ?? -1) + 1,
        completedAt: data.status === TaskStatus.DONE ? new Date() : null,
        userId: user.id,
      },
    });

    revalidateTaskViews();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateTask(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = taskUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    const data = parsed.data;
    const existing = await prisma.task.findFirst({
      where: { id: data.id, userId: user.id },
    });
    if (!existing) {
      return { ok: false, error: "Tâche introuvable." };
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

    await prisma.task.update({
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
    });

    revalidateTaskViews();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!id) {
    return { ok: false, error: "Identifiant manquant." };
  }

  try {
    await prisma.task.deleteMany({ where: { id, userId: user.id } });
    revalidateTaskViews();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function toggleTaskDone(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = taskToggleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    const { id, done } = parsed.data;
    await prisma.task.updateMany({
      where: { id, userId: user.id },
      data: {
        status: done ? TaskStatus.DONE : TaskStatus.TODO,
        completedAt: done ? new Date() : null,
      },
    });
    revalidateTaskViews();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function reorderBoard(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = taskBoardReorderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    const updates = parsed.data.columns.flatMap((column) => {
      const isDone = column.status === TaskStatus.DONE;
      return column.orderedIds.flatMap((id, index) => {
        const ops = [
          prisma.task.updateMany({
            where: { id, userId: user.id },
            data: isDone
              ? { status: column.status, position: index }
              : { status: column.status, position: index, completedAt: null },
          }),
        ];
        if (isDone) {
          ops.push(
            prisma.task.updateMany({
              where: { id, userId: user.id, completedAt: null },
              data: { completedAt: new Date() },
            })
          );
        }
        return ops;
      });
    });

    await prisma.$transaction(updates);
    revalidateTaskViews();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function addTaskComment(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = taskCommentCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    const { taskId, content } = parsed.data;
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
      select: { id: true },
    });

    if (!task) {
      return { ok: false, error: "Tâche introuvable." };
    }

    await prisma.taskComment.create({
      data: {
        content,
        taskId: task.id,
        authorId: user.id,
      },
    });

    revalidateTaskViews();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
