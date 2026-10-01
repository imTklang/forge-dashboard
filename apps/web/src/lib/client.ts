/** Cliente da API para componentes da UI (autenticado pelo cookie de sessão). */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, { ...init, headers: { "content-type": "application/json" } });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "erro");
  return body.data as T;
}

export const TASKS_CHANGED = "forge:tasks-changed";
