import type { z } from "zod";

export type ActionResult = { ok: true } | { ok: false; error: string };

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Données invalides.";
}

export function toActionError(error: unknown): ActionResult {
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  return { ok: false, error: "Une erreur inattendue est survenue." };
}
