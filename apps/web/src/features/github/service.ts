import { db } from "@/lib/db";
import { ApiError } from "@/lib/errors";

type Fetch = typeof fetch;

async function gh<T>(path: string, token: string, f: Fetch): Promise<T> {
  const res = await f(`https://api.github.com${path}`, {
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "forge-dashboard" },
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 404) throw new Error("repositório não encontrado (ou sem acesso)");
  if (res.status === 401 || res.status === 403) throw new Error(`GitHub recusou o acesso (${res.status})`);
  if (!res.ok) throw new Error(`GitHub respondeu ${res.status}`);
  return (await res.json()) as T;
}

type Commit = { commit: { message: string; author: { date: string } } };

/** Atualiza último commit, commits da semana e issues abertas de cada projeto com repositório. */
export async function syncGithub(f: Fetch = fetch, now = new Date()) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new ApiError("INTEGRATION_UNAVAILABLE", "GITHUB_TOKEN não configurado");
  const projects = await db.project.findMany({ where: { repoOwner: { not: null }, repoName: { not: null } } });
  const since = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const results: { slug: string; ok: boolean; error?: string }[] = [];

  for (const p of projects) {
    const repo = `/repos/${p.repoOwner}/${p.repoName}`;
    try {
      const [last, week, info] = await Promise.all([
        gh<Commit[]>(`${repo}/commits?per_page=1`, token, f),
        gh<Commit[]>(`${repo}/commits?since=${since}&per_page=100`, token, f),
        gh<{ open_issues_count: number }>(repo, token, f),
      ]);
      const c = last[0];
      await db.project.update({
        where: { id: p.id },
        data: {
          lastCommitAt: c ? new Date(c.commit.author.date) : null,
          lastCommitMsg: c ? c.commit.message.split("\n")[0] : null,
          commitsWeek: week.length,
          openIssues: info.open_issues_count, // inclui PRs abertos (limitação da API)
          syncedAt: now,
        },
      });
      results.push({ slug: p.slug, ok: true });
    } catch (e) {
      results.push({ slug: p.slug, ok: false, error: (e as Error).message });
    }
  }
  return { synced: results.filter((r) => r.ok).length, results };
}
