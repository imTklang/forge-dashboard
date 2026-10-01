import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { getProject } from "@/features/projects/service";

export const GET = (req: Request, { params }: { params: Promise<{ slug: string }> }) =>
  respond(async () => {
    await requireAuth(req, "read");
    return getProject((await params).slug);
  });
