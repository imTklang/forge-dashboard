import type { Task as DbTask } from "@prisma/client";
import type { SubtasksInput, TaskCreate, TaskUpdate } from "@forge/core";
import type { z } from "zod";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { shortId } from "@/lib/ids";
import { addDays, dateInTz } from "@/lib/time";
import { computeStreak } from "./streak";

type Row = DbTask & { project: { slug: string }; subtasks?: DbTask[] };

const include = { project: { select: { slug: true } }, subtasks: { orderBy: { position: "asc" as const } } };

export function toDto(t: Row) {
  return {
    id: t.id,
    title: t.title,
    project: t.project.slug,
    priority: t.priority,
    estimateMin: t.estimateMin,
    status: t.status,
    date: t.date,
    source: t.source,
    createdAt: t.createdAt.toISOString(),
    subtasks: (t.subtasks ?? []).map((s) => ({ id: s.id, title: s.title, estimateMin: s.estimateMin, status: s.status })),
  };
}

async function projectId(slug: string) {
  const p = await db.project.findUnique({ where: { slug } });
  if (!p) throw new ApiError("NOT_FOUND", `Projeto '${slug}' não encontrado`);
  return p.id;
}

async function getRow(id: string) {
  const t = await db.task.findUnique({ where: { id }, include });
  if (!t) throw new ApiError("NOT_FOUND", `Tarefa '${id}' não encontrada`);
  return t;
}

/** Move tarefas não concluídas de dias anteriores para hoje, marcando como deferred. */
export async function rollOverDeferred(today = dateInTz()) {
  const { count } = await db.task.updateMany({
    where: { date: { lt: today }, status: { in: ["todo", "doing", "deferred"] }, parentId: null },
    data: { status: "deferred", date: today },
  });
  return count;
}

export async function listTasks(f: { date?: string; status?: string[]; project?: string }) {
  await rollOverDeferred();
  const date = f.date === "today" ? dateInTz() : f.date;
  const rows = await db.task.findMany({
    where: {
      parentId: null,
      ...(date && { date }),
      ...(f.status?.length && { status: { in: f.status } }),
      ...(f.project && { project: { slug: f.project } }),
    },
    include,
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toDto);
}

export async function createTask(input: TaskCreate) {
  const date = input.date ?? dateInTz();
  const last = await db.task.aggregate({ where: { date, parentId: null }, _max: { position: true } });
  const t = await db.task.create({
    data: {
      id: shortId("tsk"),
      title: input.title,
      projectId: await projectId(input.project),
      priority: input.priority,
      estimateMin: input.estimateMin,
      date,
      source: input.source,
      position: (last._max.position ?? -1) + 1,
    },
    include,
  });
  return toDto(t);
}

export async function updateTask(id: string, input: TaskUpdate) {
  await getRow(id);
  const { project, ...rest } = input;
  const t = await db.task.update({
    where: { id },
    data: {
      ...rest,
      ...(project && { projectId: await projectId(project) }),
      ...(rest.status === "done" && { completedDate: dateInTz() }),
    },
    include,
  });
  return toDto(t);
}

export const completeTask = (id: string) => updateTask(id, { status: "done" });

/** Adia a tarefa para amanhã. */
export const deferTask = (id: string) => updateTask(id, { status: "deferred", date: addDays(dateInTz(), 1) });

export async function deleteTask(id: string) {
  await getRow(id);
  await db.task.delete({ where: { id } });
  return { id };
}

export async function addSubtasks(id: string, items: z.infer<typeof SubtasksInput>) {
  const parent = await getRow(id);
  const base = parent.subtasks?.length ?? 0;
  await db.$transaction(
    items.map((s, i) =>
      db.task.create({
        data: { id: shortId("tsk"), title: s.title, estimateMin: s.estimate, projectId: parent.projectId, date: parent.date, parentId: id, position: base + i, source: "agent" },
      }),
    ),
  );
  return toDto(await getRow(id));
}

export async function reorderTasks(ids: string[]) {
  await db.$transaction(ids.map((id, position) => db.task.update({ where: { id }, data: { position } })));
  return { ids };
}

export async function currentStreak(today = dateInTz()) {
  const rows = await db.task.findMany({ where: { completedDate: { not: null } }, select: { completedDate: true }, distinct: ["completedDate"] });
  return computeStreak(rows.map((r) => r.completedDate as string), today);
}
