import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { daySummary } from "@/features/tasks/summary";

export const dynamic = "force-dynamic";

export const GET = (req: Request) =>
  respond(async () => { await requireAuth(req, "read"); return daySummary(new URL(req.url).searchParams.get("date") ?? undefined); });
