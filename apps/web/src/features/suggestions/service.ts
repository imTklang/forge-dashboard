import type { Suggestion as Row } from "@prisma/client";
import type { z } from "zod";
import type { SuggestionInput } from "@forge/core";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { shortId } from "@/lib/ids";
import { dateInTz } from "@/lib/time";
import { createTask } from "@/features/tasks/service";

type Rowp = Row & { project: { slug: string } | null };

const toDto = (s: Rowp) => ({
  id: s.id,
  title: s.title,
  project: s.project?.slug ?? null,
  reason: s.reason,
  estimateMin: s.estimateMin,
  energy: s.energy as "high" | "medium" | "low",
  date: s.date,
  accepted: !!s.acceptedTaskId,
});

export async function listSuggestions(date = dateInTz()) {
  const rows = await db.suggestion.findMany({ where: { date }, include: { project: { select: { slug: true } } }, orderBy: { createdAt: "asc" } });
  return rows.map(toDto);
}

export async function addSuggestions(items: z.infer<typeof SuggestionInput>) {
  const created: Rowp[] = [];
  for (const s of items) {
    let projectId: string | null = null;
    if (s.project) {
      const p = await db.project.findUnique({ where: { slug: s.project } });
      if (!p) throw new ApiError("NOT_FOUND", `Projeto '${s.project}' não encontrado`);
      projectId = p.id;
    }
    created.push(
      await db.suggestion.create({
        data: { id: shortId("sug"), title: s.title, projectId, reason: s.reason, estimateMin: s.estimate, energy: s.energy, date: s.date ?? dateInTz() },
        include: { project: { select: { slug: true } } },
      }),
    );
  }
  return created.map(toDto);
}

export async function clearSuggestions(date = dateInTz()) {
  const { count } = await db.suggestion.deleteMany({ where: { date } });
  return { deleted: count, date };
}

/** "Adicionar ao checklist": cria uma tarefa (origem agente) a partir da sugestão. */
export async function acceptSuggestion(id: string) {
  const s = await db.suggestion.findUnique({ where: { id }, include: { project: { select: { slug: true } } } });
  if (!s) throw new ApiError("NOT_FOUND", `Sugestão '${id}' não encontrada`);
  if (s.acceptedTaskId) throw new ApiError("BAD_REQUEST", "Sugestão já adicionada ao checklist");
  const slug = s.project?.slug ?? (await db.project.findFirst({ orderBy: { name: "asc" } }))?.slug;
  if (!slug) throw new ApiError("BAD_REQUEST", "Nenhum projeto cadastrado");
  const task = await createTask({ title: s.title, project: slug, priority: "p2", estimateMin: s.estimateMin ?? undefined, date: dateInTz(), source: "agent" });
  await db.suggestion.update({ where: { id }, data: { acceptedTaskId: task.id } });
  return task;
}
