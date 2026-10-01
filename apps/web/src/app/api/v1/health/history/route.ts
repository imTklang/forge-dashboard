import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { ApiError } from "@/lib/errors";

export const dynamic = "force-dynamic";

// WHOOP ainda não integrado: contrato pronto, responde "integração indisponível" (exit 5 na CLI).
export const GET = (req: Request) =>
  respond(async () => {
    await requireAuth(req, "read");
    throw new ApiError("INTEGRATION_UNAVAILABLE", "WHOOP ainda não conectado");
  });
