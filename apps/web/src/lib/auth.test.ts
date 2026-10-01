import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

const findUnique = vi.fn();
const update = vi.fn();
const create = vi.fn();
vi.mock("./db", () => ({ db: { apiToken: { findUnique, update, create } } }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined }) }));

const { requireAuth, createToken } = await import("./auth");

const req = (token?: string) => new Request("http://x", { headers: token ? { authorization: `Bearer ${token}` } : {} });

beforeEach(() => {
  vi.clearAllMocks();
  process.env.FORGE_PASSWORD = "pw";
});

describe("requireAuth", () => {
  it("aceita token válido com o escopo", async () => {
    findUnique.mockResolvedValue({ id: "tok_1", scopes: "read", revokedAt: null });
    await expect(requireAuth(req("frg_abc"), "read")).resolves.toBeUndefined();
    expect(findUnique).toHaveBeenCalledWith({ where: { hash: createHash("sha256").update("frg_abc").digest("hex") } });
  });
  it("rejeita escopo ausente (FORBIDDEN)", async () => {
    findUnique.mockResolvedValue({ id: "tok_1", scopes: "read", revokedAt: null });
    await expect(requireAuth(req("frg_abc"), "write")).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("rejeita token revogado ou desconhecido", async () => {
    findUnique.mockResolvedValue({ id: "tok_1", scopes: "read,write", revokedAt: new Date() });
    await expect(requireAuth(req("frg_abc"), "read")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    findUnique.mockResolvedValue(null);
    await expect(requireAuth(req("frg_zzz"), "read")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
  it("sem Bearer nem cookie é UNAUTHORIZED", async () => {
    await expect(requireAuth(req(), "read")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

describe("createToken", () => {
  it("salva só o hash, nunca o token em claro", async () => {
    create.mockImplementation(async ({ data }) => data);
    const t = await createToken("cli", ["read"]);
    const saved = create.mock.calls[0]![0].data;
    expect(JSON.stringify(saved)).not.toContain(t.token);
    expect(saved.hash).toBe(createHash("sha256").update(t.token).digest("hex"));
  });
});
