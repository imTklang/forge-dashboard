import { respond } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { revokeToken } from "@/features/tokens/service";

export const DELETE = (_req: Request, { params }: { params: Promise<{ id: string }> }) =>
  respond(async () => {
    await requireSession();
    return revokeToken((await params).id);
  });
