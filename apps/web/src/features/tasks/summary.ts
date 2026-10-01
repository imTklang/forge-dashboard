import { db } from "@/lib/db";
import { addDays, dateInTz } from "@/lib/time";
import { currentStreak } from "./service";

/** Resumo do dia por regras (feito / adiado) + streak + heatmap dos últimos 60 dias. */
export async function daySummary(date = dateInTz()) {
  const [done, deferred, recent, streak] = await Promise.all([
    db.task.findMany({ where: { completedDate: date, parentId: null }, select: { id: true, title: true } }),
    db.task.findMany({ where: { date, status: { in: ["deferred", "todo", "doing"] }, parentId: null }, select: { id: true, title: true } }),
    db.task.findMany({ where: { completedDate: { gte: addDays(date, -60) }, parentId: null }, select: { completedDate: true } }),
    currentStreak(date),
  ]);
  const heat: Record<string, number> = {};
  for (const t of recent) if (t.completedDate) heat[t.completedDate] = (heat[t.completedDate] ?? 0) + 1;
  return { date, done, pending: deferred, streak, heat };
}
