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
import { taskBoardReorderSchema } from "@/lib/validators";

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

  const parsed = taskBoardReorderSchema.safeParse(input);
  if (!parsed.success) {
    return apiError(400, firstZodIssue(parsed.error));
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
    return apiOk({ count: updates.length });
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
