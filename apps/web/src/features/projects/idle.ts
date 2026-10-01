import { dateInTz } from "@/lib/time";

/** Dias (no fuso America/Fortaleza) entre o último commit e hoje. */
export function idleDays(lastCommitAt: Date | null, today = dateInTz()): number | null {
  if (!lastCommitAt) return null;
  const a = Date.parse(`${dateInTz(lastCommitAt)}T12:00:00Z`);
  const b = Date.parse(`${today}T12:00:00Z`);
  return Math.max(0, Math.round((b - a) / 86_400_000));
}
