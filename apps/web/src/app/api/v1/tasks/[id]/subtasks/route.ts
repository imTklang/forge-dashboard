import { SubtasksInput } from "@forge/core";
import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { addSubtasks } from "@/features/tasks/service";

export const POST = (req: Request, { params }: { params: Promise<{ id: string }> }) =>
  respond(async () => {
    await requireAuth(req, "write");
    return addSubtasks((await params).id, SubtasksInput.parse(await req.json()));
  }, 201);
