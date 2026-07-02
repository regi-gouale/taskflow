"use server";

import {
  type ActionResult,
  firstZodError,
  toActionError,
} from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/queries";
import { revalidateMemberViews } from "@/lib/revalidate";
import { memberCreateSchema, memberUpdateSchema } from "@/lib/validators";

export async function createMember(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = memberCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    await prisma.member.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        image: parsed.data.image,
        userId: user.id,
      },
    });
    revalidateMemberViews();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateMember(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = memberUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    const existing = await prisma.member.findFirst({
      where: { id: parsed.data.id, userId: user.id },
    });
    if (!existing) {
      return { ok: false, error: "Membre introuvable." };
    }

    await prisma.member.update({
      where: { id: existing.id },
      data: {
        name: parsed.data.name ?? existing.name,
        email: parsed.data.email ?? existing.email,
        role: parsed.data.role === undefined ? existing.role : parsed.data.role,
        image:
          parsed.data.image === undefined ? existing.image : parsed.data.image,
      },
    });
    revalidateMemberViews();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteMember(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!id) {
    return { ok: false, error: "Identifiant manquant." };
  }

  try {
    await prisma.member.deleteMany({ where: { id, userId: user.id } });
    revalidateMemberViews();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
