import {
  apiError,
  apiOk,
  errorMessage,
  firstZodIssue,
  readJsonBody,
  requireApiUser,
} from "@/lib/api-route";
import { prisma } from "@/lib/prisma";
import { revalidateMemberViews } from "@/lib/revalidate";
import { memberUpdateSchema } from "@/lib/validators";

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
    const member = await prisma.member.findFirst({
      where: { id, userId: user.id },
      include: {
        _count: { select: { tasks: true } },
        tasks: {
          include: {
            project: true,
          },
          orderBy: [
            { status: "asc" },
            { position: "asc" },
            { createdAt: "desc" },
          ],
        },
      },
    });

    if (!member) {
      return apiError(404, "Membre introuvable.");
    }

    return apiOk(member);
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
  const parsed = memberUpdateSchema.safeParse({ ...payload, id });
  if (!parsed.success) {
    return apiError(400, firstZodIssue(parsed.error));
  }

  try {
    const existing = await prisma.member.findFirst({
      where: { id: parsed.data.id, userId: user.id },
    });

    if (!existing) {
      return apiError(404, "Membre introuvable.");
    }

    const member = await prisma.member.update({
      where: { id: existing.id },
      data: {
        name: parsed.data.name ?? existing.name,
        email: parsed.data.email ?? existing.email,
        role: parsed.data.role === undefined ? existing.role : parsed.data.role,
        image:
          parsed.data.image === undefined ? existing.image : parsed.data.image,
      },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    revalidateMemberViews();
    return apiOk(member);
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
    const deleted = await prisma.member.deleteMany({
      where: { id, userId: user.id },
    });

    if (deleted.count === 0) {
      return apiError(404, "Membre introuvable.");
    }

    revalidateMemberViews();
    return apiOk({ id });
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
