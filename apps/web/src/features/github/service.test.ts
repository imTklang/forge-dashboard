import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const update = vi.fn();
vi.mock("@/lib/db", () => ({ db: { project: { findMany, update } } }));

const { syncGithub } = await import("./service");

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const commit = (date: string, message: string) => ({ commit: { message, author: { date } } });

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GITHUB_TOKEN = "ghp_secret";
  findMany.mockResolvedValue([{ id: "prj_1", slug: "ideario", repoOwner: "me", repoName: "ideario" }]);
});

describe("syncGithub", () => {
  it("sem GITHUB_TOKEN → INTEGRATION_UNAVAILABLE", async () => {
    delete process.env.GITHUB_TOKEN;
    await expect(syncGithub(vi.fn())).rejects.toMatchObject({ code: "INTEGRATION_UNAVAILABLE" });
  });

  it("grava último commit, commits da semana e issues", async () => {
    const f = vi.fn(async (url: string, _init?: RequestInit) => {
      if (url.includes("since=")) return json([commit("2026-09-30T10:00:00Z", "a"), commit("2026-09-29T10:00:00Z", "b")]);
      if (url.includes("/commits?per_page=1")) return json([commit("2026-09-30T10:00:00Z", "feat: x\n\ncorpo")]);
      return json({ open_issues_count: 3 });
    });
    const r = await syncGithub(f as unknown as typeof fetch, new Date("2026-10-01T12:00:00Z"));
    expect(r).toEqual({ synced: 1, results: [{ slug: "ideario", ok: true }] });
    expect(update.mock.calls[0]![0].data).toMatchObject({ lastCommitMsg: "feat: x", commitsWeek: 2, openIssues: 3 });
    expect(f.mock.calls[0]![1]).toMatchObject({ headers: { authorization: "Bearer ghp_secret" } });
  });

  it("falha em um repo não derruba os outros e não vaza o token", async () => {
    const r = await syncGithub((async () => json({}, 404)) as unknown as typeof fetch);
    expect(r.synced).toBe(0);
    expect(r.results[0]).toMatchObject({ ok: false });
    expect(JSON.stringify(r)).not.toContain("ghp_secret");
  });
});
