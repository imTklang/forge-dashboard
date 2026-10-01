import { TIMEZONE } from "@forge/core";

/** Data YYYY-MM-DD no fuso America/Fortaleza. */
export function dateInTz(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(d);
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Data, hora (HH:mm) e dia da semana atuais no fuso America/Fortaleza. */
export function nowInTz(d: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { date: dateInTz(d), time: `${get("hour")}:${get("minute")}`, weekday };
}
