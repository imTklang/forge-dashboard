import { respond } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { currentStreak, listTasks } from "@/features/tasks/service";
import { listProjects } from "@/features/projects/service";
import { listSuggestions } from "@/features/suggestions/service";
import { listReminders } from "@/features/reminders/service";
import { getMotivation } from "@/features/motivation/service";
import { dateInTz } from "@/lib/time";

export const dynamic = "force-dynamic";

/** Snapshot do dia para agentes. Saúde (WHOOP) entra quando integrado. */
export const GET = (req: Request) =>
  respond(async () => {
    await requireAuth(req, "read");
    const date = new URL(req.url).searchParams.get("date") ?? dateInTz();
    const [streak, tasks, projects, suggestions, motivation, reminders] = await Promise.all([
      currentStreak(date),
      listTasks({ date, status: ["todo", "doing", "deferred"] }),
      listProjects(),
      listSuggestions(date),
      getMotivation(date),
      listReminders(),
    ]);
    return { date, streak, tasks, projects, health: null, motivation, suggestions, reminders: reminders.filter((r) => r.active) };
  });
