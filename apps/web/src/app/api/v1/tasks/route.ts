import { TaskCreate } from "@forge/core";
import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { createTask, listTasks } from "@/features/tasks/service";

export const dynamic = "force-dynamic";

export const GET = (req: Request) =>
  respond(async () => {
    await requireAuth(req, "read");
    const q = new URL(req.url).searchParams;
    return listTasks({ date: q.get("date") ?? undefined, status: q.get("status")?.split(","), project: q.get("project") ?? undefined });
  });

export const POST = (req: Request) =>
  respond(async () => {
    await requireAuth(req, "write");
    return createTask(TaskCreate.parse(await req.json()));
  }, 201);
