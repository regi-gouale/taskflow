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
import { taskCommentCreateSchema } from "@/lib/validators";

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

  const parsed = taskCommentCreateSchema.safeParse(input);
  if (!parsed.success) {
    return apiError(400, firstZodIssue(parsed.error));
  }

  try {
    const { taskId, content } = parsed.data;
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: user.id },
      select: { id: true },
    });

    if (!task) {
      return apiError(404, "Tache introuvable.");
    }

    const comment = await prisma.taskComment.create({
      data: {
        content,
        taskId: task.id,
        authorId: user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    revalidateTaskViews();
    return apiOk(comment, 201);
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
