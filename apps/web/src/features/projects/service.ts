import type { Project } from "@prisma/client";
import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { shortId } from "@/lib/ids";
import { idleDays } from "./idle";

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

const repoOf = (p: Project) => (p.repoOwner && p.repoName ? `${p.repoOwner}/${p.repoName}` : null);

function summary(p: Project, openTasks: number) {
  return {
    slug: p.slug,
    name: p.name,
    color: p.color,
    repo: repoOf(p),
    openTasks,
    idleDays: idleDays(p.lastCommitAt),
    lastCommit: p.lastCommitAt ? { at: p.lastCommitAt.toISOString(), message: p.lastCommitMsg ?? "" } : null,
    commitsWeek: p.commitsWeek,
    openIssues: p.openIssues,
  };
}

export async function listProjects() {
  const rows = await db.project.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { tasks: { where: { status: { in: ["todo", "doing", "deferred"] }, parentId: null } } } } },
  });
  return rows.map((p) => summary(p, p._count.tasks));
}

export async function getProject(slug: string) {
  const p = await db.project.findUnique({ where: { slug } });
  if (!p) throw new ApiError("NOT_FOUND", `Projeto '${slug}' não encontrado`);
  const tasks = await db.task.findMany({ where: { projectId: p.id, parentId: null, status: { not: "done" } }, orderBy: { position: "asc" } });
  return { ...summary(p, tasks.length), tasks: tasks.map((t) => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, date: t.date })) };
}

export async function setRepo(slug: string, repo: string | null) {
  const p = await db.project.findUnique({ where: { slug } });
  if (!p) throw new ApiError("NOT_FOUND", `Projeto '${slug}' não encontrado`);
  const [repoOwner, repoName] = repo ? repo.split("/") : [null, null];
  const updated = await db.project.update({ where: { slug }, data: { repoOwner, repoName, lastCommitAt: null, lastCommitMsg: null, commitsWeek: 0, openIssues: 0, syncedAt: null } });
  return summary(updated, 0);
}
