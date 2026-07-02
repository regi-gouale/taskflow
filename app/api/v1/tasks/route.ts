import { TaskPriority, TaskStatus } from "@/generated/prisma/client";
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
import { taskCreateSchema } from "@/lib/validators";

type TaskListFilters = {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
};

function parseTaskFilters(url: URL): TaskListFilters | null {
  const params = url.searchParams;

  const status = params.get("status");
  if (status && !Object.values(TaskStatus).includes(status as TaskStatus)) {
    return null;
  }

  const priority = params.get("priority");
  if (
    priority &&
    !Object.values(TaskPriority).includes(priority as TaskPriority)
  ) {
    return null;
  }

  return {
    projectId: params.get("projectId") || undefined,
    assigneeId: params.get("assigneeId") || undefined,
    status: (status as TaskStatus | null) ?? undefined,
    priority: (priority as TaskPriority | null) ?? undefined,
    search: params.get("search") || undefined,
  };
}

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

export async function GET(request: Request) {
  const user = await requireApiUser();
  if (user instanceof Response) {
    return user;
  }

  const filters = parseTaskFilters(new URL(request.url));
  if (!filters) {
    return apiError(400, "Filtres invalides.");
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
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

    return apiOk(tasks);
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}

export async function POST(request: Request) {
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

  const parsed = taskCreateSchema.safeParse(input);
  if (!parsed.success) {
    return apiError(400, firstZodIssue(parsed.error));
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

    const task = await prisma.task.create({
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
      include: {
        project: true,
        assignee: true,
      },
    });

    revalidateTaskViews();
    return apiOk(task, 201);
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
