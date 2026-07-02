import { headers } from "next/headers";
import type { ZodError } from "zod";
import { auth } from "@/lib/auth";
import type { SessionUser } from "@/lib/queries";

export function apiOk<T>(data: T, status = 200) {
  return Response.json({ ok: true as const, data }, { status });
}

export function apiError(status: number, error: string) {
  return Response.json({ ok: false as const, error }, { status });
}

export async function requireApiUser(): Promise<SessionUser | Response> {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as SessionUser | undefined;

  if (!user) {
    return apiError(401, "Non authentifie.");
  }

  return user;
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new Error("Corps JSON invalide.");
  }
}

export function firstZodIssue(error: ZodError): string {
  return error.issues[0]?.message ?? "Donnees invalides.";
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur inattendue est survenue.";
}
