import { TIMEZONE } from "@forge/core";

const time = new Intl.DateTimeFormat("pt-BR", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit" });

/** HH:mm no fuso America/Fortaleza. */
export const formatTime = (iso: string) => time.format(new Date(iso));

/** Hora cheia (0–23) atual no fuso America/Fortaleza. */
export const currentHour = () => Number(new Intl.DateTimeFormat("en-US", { timeZone: TIMEZONE, hour: "2-digit", hourCycle: "h23" }).format(new Date()));

/** Soma `n` dias a uma data YYYY-MM-DD. */
export function addDaysIso(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
