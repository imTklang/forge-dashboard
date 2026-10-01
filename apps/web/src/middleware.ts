import { NextResponse, type NextRequest } from "next/server";

/** Protege as páginas da UI. A API (/api/*) faz a própria checagem (Bearer ou cookie). */
export function middleware(req: NextRequest) {
  const has = req.cookies.has("forge_session");
  if (!has && req.nextUrl.pathname !== "/login") return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next|favicon.ico).*)"] };
