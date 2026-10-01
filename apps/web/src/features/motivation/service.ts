import { db } from "@/lib/db";
import { addDays, dateInTz } from "@/lib/time";
import { currentStreak } from "@/features/tasks/service";
import { listProjects } from "@/features/projects/service";
import { fallbackMessage } from "./rules";

export async function setMotivation(text: string, date = dateInTz()) {
  await db.dailyMessage.upsert({ where: { date }, update: { text }, create: { date, text } });
  return { date, text, source: "agent" as const };
}

export async function getMotivation(date = dateInTz()) {
  const row = await db.dailyMessage.findUnique({ where: { date } });
  if (row) return { date, text: row.text, source: "agent" as const };

  const [streak, doneYesterday, openToday, projects] = await Promise.all([
    currentStreak(date),
    db.task.count({ where: { completedDate: addDays(date, -1), parentId: null } }),
    db.task.count({ where: { date, status: { in: ["todo", "doing", "deferred"] }, parentId: null } }),
    listProjects(),
  ]);
  const idle = projects.filter((p) => p.idleDays !== null).sort((a, b) => (b.idleDays ?? 0) - (a.idleDays ?? 0))[0];
  const text = fallbackMessage({ streak, doneYesterday, openToday, idleProject: idle ? { name: idle.name, days: idle.idleDays! } : null });
  return { date, text, source: "rule" as const };
}
