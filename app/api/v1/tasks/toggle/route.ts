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
import { taskToggleSchema } from "@/lib/validators";

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

  const parsed = taskToggleSchema.safeParse(input);
  if (!parsed.success) {
    return apiError(400, firstZodIssue(parsed.error));
  }

  try {
    const { id, done } = parsed.data;
    const updated = await prisma.task.updateMany({
      where: { id, userId: user.id },
      data: {
        status: done ? TaskStatus.DONE : TaskStatus.TODO,
        completedAt: done ? new Date() : null,
      },
    });

    if (updated.count === 0) {
      return apiError(404, "Tache introuvable.");
    }

    revalidateTaskViews();
    return apiOk({ id, done });
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
