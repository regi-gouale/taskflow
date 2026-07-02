export type ApiClientResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiClientResult<T>> {
  try {
    const response = await fetch(path, {
      method: options.method ?? "GET",
      headers:
        options.body === undefined
          ? undefined
          : { "Content-Type": "application/json" },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      data?: T;
      error?: string;
    } | null;

    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error ?? "La requete API a echoue.",
      };
    }

    if (payload?.ok !== true) {
      return {
        ok: false,
        error: payload?.error ?? "Reponse API invalide.",
      };
    }

    return {
      ok: true,
      data: payload.data as T,
    };
  } catch {
    return { ok: false, error: "Erreur reseau." };
  }
}
