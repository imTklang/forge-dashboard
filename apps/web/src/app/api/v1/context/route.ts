import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { currentStreak, listTasks } from "@/features/tasks/service";
import { listProjects } from "@/features/projects/service";
import { dateInTz } from "@/lib/time";

export const dynamic = "force-dynamic";

/** Snapshot do dia para agentes. Saúde/sugestões/lembretes entram nas fases seguintes. */
export const GET = (req: Request) =>
  respond(async () => {
    await requireAuth(req, "read");
    const date = new URL(req.url).searchParams.get("date") ?? dateInTz();
    return {
      date,
      streak: await currentStreak(date),
      tasks: await listTasks({ date, status: ["todo", "doing", "deferred"] }),
      projects: await listProjects(),
      health: null,
      suggestions: [],
      reminders: [],
    };
  });
