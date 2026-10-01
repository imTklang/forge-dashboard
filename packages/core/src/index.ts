import { z } from "zod";

export const TIMEZONE = "America/Fortaleza";
export const API_VERSION = 1;

export const TaskStatus = z.enum(["todo", "doing", "done", "deferred"]);
export const Priority = z.enum(["p1", "p2", "p3"]);
export const Energy = z.enum(["high", "medium", "low"]);
export const Source = z.enum(["manual", "agent"]);
export const Repeat = z.enum(["none", "daily", "weekdays"]);

export const Task = z.object({
  id: z.string(),
  title: z.string().min(1),
  project: z.string(),
  priority: Priority,
  estimateMin: z.number().int().positive().nullable(),
  status: TaskStatus,
  date: z.string(),
  source: Source,
});
export type Task = z.infer<typeof Task>;

export const RecoveryZone = z.enum(["green", "yellow", "red"]);
export type RecoveryZone = z.infer<typeof RecoveryZone>;

/** WHOOP recovery zones: green 67–100, yellow 34–66, red 0–33. */
export function recoveryZone(score: number): RecoveryZone {
  if (score >= 67) return "green";
  if (score >= 34) return "yellow";
  return "red";
}

export const ok = <T>(data: T) => ({ version: API_VERSION, data });
