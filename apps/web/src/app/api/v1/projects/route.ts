import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { listProjects } from "@/features/projects/service";

export const dynamic = "force-dynamic";

export const GET = (req: Request) =>
  respond(async () => {
    await requireAuth(req, "read");
    return listProjects();
  });
