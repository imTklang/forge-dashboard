import { ReorderInput } from "@forge/core";
import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { reorderTasks } from "@/features/tasks/service";

export const POST = (req: Request) =>
  respond(async () => {
    await requireAuth(req, "write");
    return reorderTasks(ReorderInput.parse(await req.json()).ids);
  });
