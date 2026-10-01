import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { completeTask } from "@/features/tasks/service";

export const POST = (req: Request, { params }: { params: Promise<{ id: string }> }) =>
  respond(async () => {
    await requireAuth(req, "write");
    return completeTask((await params).id);
  });
