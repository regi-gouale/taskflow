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
import { revalidateProjectViews } from "@/lib/revalidate";
import { projectCreateSchema } from "@/lib/validators";

async function getProjectsWithProgress(userId: string) {
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

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof Response) {
    return user;
  }

  try {
    const projects = await getProjectsWithProgress(user.id);
    return apiOk(projects);
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

  const parsed = projectCreateSchema.safeParse(input);
  if (!parsed.success) {
    return apiError(400, firstZodIssue(parsed.error));
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        color: parsed.data.color,
        status: parsed.data.status,
        userId: user.id,
      },
    });

    revalidateProjectViews();
    return apiOk(project, 201);
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
