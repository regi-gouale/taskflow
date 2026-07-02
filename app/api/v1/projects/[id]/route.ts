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
import { projectUpdateSchema } from "@/lib/validators";

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
    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
      include: {
        tasks: {
          include: {
            assignee: true,
            comments: {
              include: {
                author: {
                  select: { id: true, name: true, email: true },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!project) {
      return apiError(404, "Projet introuvable.");
    }

    return apiOk(project);
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
  const parsed = projectUpdateSchema.safeParse({ ...payload, id });
  if (!parsed.success) {
    return apiError(400, firstZodIssue(parsed.error));
  }

  try {
    const existing = await prisma.project.findFirst({
      where: { id: parsed.data.id, userId: user.id },
    });

    if (!existing) {
      return apiError(404, "Projet introuvable.");
    }

    const project = await prisma.project.update({
      where: { id: existing.id },
      data: {
        name: parsed.data.name ?? existing.name,
        description:
          parsed.data.description === undefined
            ? existing.description
            : parsed.data.description,
        color:
          parsed.data.color === undefined ? existing.color : parsed.data.color,
        status: parsed.data.status ?? existing.status,
      },
    });

    revalidateProjectViews();
    return apiOk(project);
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
    const deleted = await prisma.project.deleteMany({
      where: { id, userId: user.id },
    });

    if (deleted.count === 0) {
      return apiError(404, "Projet introuvable.");
    }

    revalidateProjectViews();
    return apiOk({ id });
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
