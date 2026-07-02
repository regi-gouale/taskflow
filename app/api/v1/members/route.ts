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
import { memberCreateSchema } from "@/lib/validators";

export async function GET() {
  const user = await requireApiUser();
  if (user instanceof Response) {
    return user;
  }

  try {
    const members = await prisma.member.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { tasks: true } } },
    });

    return apiOk(members);
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

  const parsed = memberCreateSchema.safeParse(input);
  if (!parsed.success) {
    return apiError(400, firstZodIssue(parsed.error));
  }

  try {
    const member = await prisma.member.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        image: parsed.data.image,
        userId: user.id,
      },
      include: { _count: { select: { tasks: true } } },
    });

    revalidateMemberViews();
    return apiOk(member, 201);
  } catch (error) {
    return apiError(500, errorMessage(error));
  }
}
