import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { syncGithub } from "@/features/github/service";

export const POST = (req: Request) => respond(async () => { await requireAuth(req, "write"); return syncGithub(); });
