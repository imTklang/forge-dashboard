import { TaskUpdate } from "@forge/core";
import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { deleteTask, updateTask } from "@/features/tasks/service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = (req: Request, { params }: Ctx) =>
  respond(async () => {
    await requireAuth(req, "write");
    return updateTask((await params).id, TaskUpdate.parse(await req.json()));
  });

export const DELETE = (req: Request, { params }: Ctx) =>
  respond(async () => {
    await requireAuth(req, "write");
    return deleteTask((await params).id);
  });
