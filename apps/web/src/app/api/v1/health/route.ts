import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Ping autenticado: usado pelo `forge doctor` para validar API + token. */
export const GET = (req: Request) =>
  respond(async () => {
    await requireAuth(req, "read");
    return { status: "ok", integrations: { whoop: "not_configured", github: "not_configured" } };
  });
