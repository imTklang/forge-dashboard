import { NextResponse } from "next/server";
import { passwordOk, SESSION_COOKIE, sessionValue } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !passwordOk(password)) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Senha incorreta" } }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionValue(), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
