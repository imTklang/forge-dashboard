export type ReminderRow = { id: string; timeOfDay: string; repeat: string; active: boolean; lastFiredDate: string | null };

/**
 * Lembretes que devem disparar agora: ativos, horário já alcançado hoje e ainda não disparados hoje.
 * `weekday`: 0=domingo … 6=sábado.
 */
export function dueReminders<T extends ReminderRow>(rows: T[], now: { date: string; time: string; weekday: number }): T[] {
  return rows.filter((r) => {
    if (!r.active || r.lastFiredDate === now.date || r.timeOfDay > now.time) return false;
    if (r.repeat === "weekdays" && (now.weekday === 0 || now.weekday === 6)) return false;
    return true;
  });
}
