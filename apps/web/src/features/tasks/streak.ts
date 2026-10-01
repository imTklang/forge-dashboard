import { addDays } from "@/lib/time";

/**
 * Streak atual: dias consecutivos (terminando hoje ou ontem) com ≥1 tarefa concluída.
 * Se hoje ainda não teve conclusão, o streak de ontem continua válido.
 */
export function computeStreak(completedDates: string[], today: string): number {
  const days = new Set(completedDates);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(cursor)) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}
