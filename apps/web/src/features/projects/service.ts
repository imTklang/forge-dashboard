import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { shortId } from "@/lib/ids";

export const SEED_PROJECTS = [
  { slug: "ideario", name: "Ideario", color: "#ff6b1a" },
  { slug: "agu", name: "AGU", color: "#60a5fa" },
  { slug: "gasbras", name: "GASBRAS", color: "#34d399" },
  { slug: "arremex", name: "Arremex", color: "#a78bfa" },
  { slug: "locfly", name: "LocFly", color: "#fbbf24" },
  { slug: "portfolio", name: "Portfólio", color: "#f87171" },
];

export async function seedProjects() {
  for (const p of SEED_PROJECTS) {
    await db.project.upsert({ where: { slug: p.slug }, update: {}, create: { id: shortId("prj"), ...p } });
  }
}

export async function listProjects() {
  const rows = await db.project.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { tasks: { where: { status: { in: ["todo", "doing", "deferred"] }, parentId: null } } } } } });
  return rows.map((p) => ({ slug: p.slug, name: p.name, color: p.color, repo: p.repoOwner && p.repoName ? `${p.repoOwner}/${p.repoName}` : null, openTasks: p._count.tasks }));
}

export async function getProject(slug: string) {
  const p = await db.project.findUnique({ where: { slug } });
  if (!p) throw new ApiError("NOT_FOUND", `Projeto '${slug}' não encontrado`);
  const tasks = await db.task.findMany({ where: { projectId: p.id, parentId: null, status: { not: "done" } }, orderBy: { position: "asc" } });
  return { slug: p.slug, name: p.name, color: p.color, repo: p.repoOwner && p.repoName ? `${p.repoOwner}/${p.repoName}` : null, openTasks: tasks.map((t) => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, date: t.date })) };
}
