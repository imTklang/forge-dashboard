import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { deferTask } from "@/features/tasks/service";

export const POST = (req: Request, { params }: { params: Promise<{ id: string }> }) =>
  respond(async () => {
    await requireAuth(req, "write");
    return deferTask((await params).id);
  });
