import { z } from "zod";

export const TIMEZONE = "America/Fortaleza";
export const API_VERSION = 1;

export const TaskStatus = z.enum(["todo", "doing", "done", "deferred"]);
export const Priority = z.enum(["p1", "p2", "p3"]);
export const Energy = z.enum(["high", "medium", "low"]);
export const Source = z.enum(["manual", "agent"]);
export const Repeat = z.enum(["none", "daily", "weekdays"]);

export const Subtask = z.object({
  id: z.string(),
  title: z.string(),
  estimateMin: z.number().nullable(),
  status: TaskStatus,
});

export const Task = z.object({
  id: z.string(),
  title: z.string().min(1),
  project: z.string(),
  priority: Priority,
  estimateMin: z.number().int().positive().nullable(),
  status: TaskStatus,
  date: z.string(),
  source: Source,
  subtasks: z.array(Subtask),
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

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");

export const TaskCreate = z.object({
  title: z.string().min(1),
  project: z.string().min(1),
  priority: Priority.default("p2"),
  estimateMin: z.number().int().positive().optional(),
  date: IsoDate.optional(),
  source: Source.default("manual"),
});
export type TaskCreate = z.infer<typeof TaskCreate>;

export const TaskUpdate = z.object({
  title: z.string().min(1).optional(),
  project: z.string().optional(),
  priority: Priority.optional(),
  estimateMin: z.number().int().positive().nullable().optional(),
  status: TaskStatus.optional(),
  date: IsoDate.optional(),
});
export type TaskUpdate = z.infer<typeof TaskUpdate>;

export const SubtasksInput = z.array(z.object({ title: z.string().min(1), estimate: z.number().int().positive().optional() })).min(1);

export const ReorderInput = z.object({ ids: z.array(z.string()).min(1) });

export const TokenCreate = z.object({
  name: z.string().min(1).max(60),
  scopes: z.array(z.enum(["read", "write"])).min(1).default(["read", "write"]),
});

export const ProjectSummary = z.object({
  slug: z.string(),
  name: z.string(),
  color: z.string(),
  repo: z.string().nullable(),
  openTasks: z.number(),
  /** Dias desde o último commit (null se sem repo/sync). */
  idleDays: z.number().nullable(),
  lastCommit: z.object({ at: z.string(), message: z.string() }).nullable(),
  commitsWeek: z.number(),
  openIssues: z.number(),
});

export const ProjectUpdate = z.object({
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/, "use owner/nome").nullable(),
});

export const SuggestionInput = z.array(
  z.object({
    title: z.string().min(1),
    project: z.string().optional(),
    reason: z.string().min(1),
    estimate: z.number().int().positive().optional(),
    energy: Energy.default("medium"),
    date: IsoDate.optional(),
  }),
).min(1);

export const Suggestion = z.object({
  id: z.string(),
  title: z.string(),
  project: z.string().nullable(),
  reason: z.string(),
  estimateMin: z.number().nullable(),
  energy: Energy,
  date: z.string(),
  accepted: z.boolean(),
});

export const MotivationSet = z.object({ text: z.string().min(1).max(280), date: IsoDate.optional() });

export const Motivation = z.object({ date: z.string(), text: z.string(), source: z.enum(["agent", "rule"]) });

const HHmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "use HH:mm");

export const ReminderCreate = z.object({
  text: z.string().min(1).max(200),
  at: HHmm,
  repeat: Repeat.default("none"),
});

export const ReminderUpdate = z.object({
  text: z.string().min(1).max(200).optional(),
  at: HHmm.optional(),
  repeat: Repeat.optional(),
  active: z.boolean().optional(),
});

export const Reminder = z.object({
  id: z.string(),
  text: z.string(),
  at: z.string(),
  repeat: Repeat,
  active: z.boolean(),
});

export const Context = z.object({
  date: z.string(),
  streak: z.number(),
  tasks: z.array(Task),
  projects: z.array(ProjectSummary),
  health: z.unknown().nullable(),
  motivation: Motivation,
  suggestions: z.array(Suggestion),
  reminders: z.array(Reminder),
});
export type Context = z.infer<typeof Context>;
