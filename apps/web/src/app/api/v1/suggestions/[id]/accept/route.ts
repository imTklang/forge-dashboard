import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { acceptSuggestion } from "@/features/suggestions/service";

export const POST = (req: Request, { params }: { params: Promise<{ id: string }> }) =>
  respond(async () => { await requireAuth(req, "write"); return acceptSuggestion((await params).id); }, 201);
