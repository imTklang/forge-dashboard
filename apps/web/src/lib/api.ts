import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ok } from "@forge/core";
import { ApiError } from "./errors";

/** Envolve um handler: serializa {version,data} e padroniza erros {error:{code,message}}. */
export async function respond<T>(fn: () => Promise<T>, status = 200) {
  try {
    return NextResponse.json(ok(await fn()), { status });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: e.status });
    if (e instanceof ZodError) return NextResponse.json({ error: { code: "BAD_REQUEST", message: e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") } }, { status: 400 });
    console.error("internal error", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ error: { code: "INTERNAL", message: "Erro interno" } }, { status: 500 });
  }
}
