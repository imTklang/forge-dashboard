import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { currentStreak, listTasks } from "@/features/tasks/service";
import { listProjects } from "@/features/projects/service";
import { listSuggestions } from "@/features/suggestions/service";
import { getMotivation } from "@/features/motivation/service";
import { dateInTz } from "@/lib/time";

export const dynamic = "force-dynamic";

/** Snapshot do dia para agentes. Saúde (WHOOP) e lembretes entram quando integrados. */
export const GET = (req: Request) =>
  respond(async () => {
    await requireAuth(req, "read");
    const date = new URL(req.url).searchParams.get("date") ?? dateInTz();
    const [streak, tasks, projects, suggestions, motivation] = await Promise.all([
      currentStreak(date),
      listTasks({ date, status: ["todo", "doing", "deferred"] }),
      listProjects(),
      listSuggestions(date),
      getMotivation(date),
    ]);
    return { date, streak, tasks, projects, health: null, motivation, suggestions, reminders: [] };
  });
