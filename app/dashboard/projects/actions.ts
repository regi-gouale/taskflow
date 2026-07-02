"use server";

import {
  type ActionResult,
  firstZodError,
  toActionError,
} from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/queries";
import { revalidateProjectViews } from "@/lib/revalidate";
import { projectCreateSchema, projectUpdateSchema } from "@/lib/validators";

export async function createProject(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = projectCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        color: parsed.data.color,
        status: parsed.data.status,
        userId: user.id,
      },
    });
    revalidateProjectViews();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateProject(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = projectUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  try {
    const existing = await prisma.project.findFirst({
      where: { id: parsed.data.id, userId: user.id },
    });
    if (!existing) {
      return { ok: false, error: "Projet introuvable." };
    }

    await prisma.project.update({
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
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!id) {
    return { ok: false, error: "Identifiant manquant." };
  }

  try {
    await prisma.project.deleteMany({ where: { id, userId: user.id } });
    revalidateProjectViews();
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}
