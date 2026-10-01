import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";
import { ApiError } from "./errors";
import { shortId } from "./ids";

export const SESSION_COOKIE = "forge_session";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Valor do cookie de sessão derivado da senha única (single-user). */
export function sessionValue() {
  const pw = process.env.FORGE_PASSWORD;
  if (!pw) throw new ApiError("INTERNAL", "FORGE_PASSWORD não configurada");
  return sha256(`forge:${pw}`);
}

export function passwordOk(input: string) {
  const pw = process.env.FORGE_PASSWORD;
  return !!pw && input === pw;
}

export async function createToken(name: string, scopes: string[]) {
  const token = `frg_${randomBytes(24).toString("hex")}`;
  const row = await db.apiToken.create({
    data: { id: shortId("tok"), name, hash: sha256(token), scopes: scopes.join(",") },
  });
  return { id: row.id, name, scopes, token }; // token em claro só aparece aqui
}

export type Scope = "read" | "write";

/** Aceita Bearer token (CLI/agentes) ou cookie de sessão (UI). */
export async function requireAuth(req: Request, scope: Scope) {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const row = await db.apiToken.findUnique({ where: { hash: sha256(header.slice(7)) } });
    if (!row || row.revokedAt) throw new ApiError("UNAUTHORIZED", "Token inválido ou revogado");
    if (!row.scopes.split(",").includes(scope)) throw new ApiError("FORBIDDEN", `Token sem escopo ${scope}`);
    await db.apiToken.update({ where: { id: row.id }, data: { lastUsedAt: new Date() } });
    return;
  }
  await requireSession();
}

export async function requireSession() {
  const c = (await cookies()).get(SESSION_COOKIE)?.value;
  if (c !== sessionValue()) throw new ApiError("UNAUTHORIZED", "Não autenticado");
}
