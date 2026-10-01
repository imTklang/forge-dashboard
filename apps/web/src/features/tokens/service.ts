import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";

export async function listTokens() {
  const rows = await db.apiToken.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((t) => ({ id: t.id, name: t.name, scopes: t.scopes.split(","), lastUsedAt: t.lastUsedAt, revoked: !!t.revokedAt, createdAt: t.createdAt }));
}

export async function revokeToken(id: string) {
  const t = await db.apiToken.findUnique({ where: { id } });
  if (!t) throw new ApiError("NOT_FOUND", `Token '${id}' não encontrado`);
  await db.apiToken.update({ where: { id }, data: { revokedAt: new Date() } });
  return { id };
}
