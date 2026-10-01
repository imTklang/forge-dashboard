import { TokenCreate } from "@forge/core";
import { respond } from "@/lib/api";
import { createToken, requireSession } from "@/lib/auth";
import { listTokens } from "@/features/tokens/service";

export const dynamic = "force-dynamic";

// Gestão de tokens só pela UI (cookie de sessão), nunca por Bearer.
export const GET = () =>
  respond(async () => {
    await requireSession();
    return listTokens();
  });

export const POST = (req: Request) =>
  respond(async () => {
    await requireSession();
    const input = TokenCreate.parse(await req.json());
    return createToken(input.name, input.scopes);
  }, 201);
