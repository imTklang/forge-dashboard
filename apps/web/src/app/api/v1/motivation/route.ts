import { MotivationSet } from "@forge/core";
import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { getMotivation, setMotivation } from "@/features/motivation/service";

export const dynamic = "force-dynamic";

export const GET = (req: Request) =>
  respond(async () => { await requireAuth(req, "read"); return getMotivation(new URL(req.url).searchParams.get("date") ?? undefined); });

export const PUT = (req: Request) =>
  respond(async () => {
    await requireAuth(req, "write");
    const b = MotivationSet.parse(await req.json());
    return setMotivation(b.text, b.date);
  });
