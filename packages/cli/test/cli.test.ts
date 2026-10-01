import { spawn } from "node:child_process";
import { createServer, type Server } from "node:http";
import { mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const BIN = join(__dirname, "../dist/index.js");
const TOKEN = "frg_supersecret123";
const task = { id: "tsk_aaaa", title: "Teste", project: "portfolio", priority: "p1", estimateMin: 45, status: "todo", date: "2026-09-30", source: "agent", subtasks: [] };
const seen: { method: string; url: string; body: string }[] = [];

let server: Server;
let base = "";
let home = "";

beforeAll(async () => {
  home = mkdtempSync(join(tmpdir(), "forge-cli-"));
  server = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      seen.push({ method: req.method!, url: req.url!, body });
      const send = (status: number, payload: unknown) => {
        res.writeHead(status, { "content-type": "application/json" });
        res.end(JSON.stringify(payload));
      };
      if (req.headers.authorization !== `Bearer ${TOKEN}`) return send(401, { error: { code: "UNAUTHORIZED", message: "Token inválido ou revogado" } });
      if (req.url!.startsWith("/api/v1/health")) return send(200, { version: 1, data: { status: "ok", integrations: { whoop: "not_configured" } } });
      if (req.url === "/api/v1/tasks/tsk_nope/done") return send(404, { error: { code: "NOT_FOUND", message: "Tarefa 'tsk_nope' não encontrada" } });
      if (req.url!.startsWith("/api/v1/tasks") && req.method === "GET") return send(200, { version: 1, data: [task] });
      if (req.url === "/api/v1/tasks" && req.method === "POST") return send(201, { version: 1, data: { ...task, ...JSON.parse(body) } });
      if (req.url!.startsWith("/api/v1/context")) return send(200, { version: 1, data: { date: "2026-09-30", streak: 3, tasks: [task], projects: [{ slug: "portfolio", name: "Portfólio", color: "#f00", repo: null, openTasks: 1, idleDays: 9, lastCommit: { at: "2026-09-21T10:00:00Z", message: "style: hero" }, commitsWeek: 0, openIssues: 1 }], health: null, motivation: { date: "2026-09-30", text: "msg", source: "rule" }, suggestions: [], reminders: [] } });
      if (req.url!.startsWith("/api/v1/sync/whoop")) return send(503, { error: { code: "INTEGRATION_UNAVAILABLE", message: "WHOOP ainda não conectado" } });
      if (req.url!.startsWith("/api/v1/motivation") && req.method === "GET") return send(200, { version: 1, data: { date: "2026-09-30", text: "6 dias seguidos.", source: "rule" } });
      send(404, { error: { code: "NOT_FOUND", message: "rota" } });
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(() => server.close());

function run(args: string[], opts: { env?: Record<string, string>; stdin?: string } = {}) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
    const p = spawn("node", [BIN, ...args], {
      env: { PATH: process.env.PATH!, HOME: home, XDG_CONFIG_HOME: join(home, ".config"), FORGE_API_URL: base, FORGE_TOKEN: TOKEN, ...opts.env },
    });
    let stdout = "";
    let stderr = "";
    p.stdout.on("data", (c) => (stdout += c));
    p.stderr.on("data", (c) => (stderr += c));
    p.on("close", (code) => resolve({ code: code ?? -1, stdout, stderr }));
    p.stdin.end(opts.stdin ?? "");
  });
}

describe("contrato --json", () => {
  it("tasks list --json: stdout é {version:1,data}, sem ruído", async () => {
    const r = await run(["tasks", "list", "--json"]);
    expect(r.code).toBe(0);
    expect(r.stderr).toBe("");
    expect(JSON.parse(r.stdout)).toEqual({ version: 1, data: [task] });
  });

  it("context --json valida e devolve o snapshot", async () => {
    const r = await run(["context", "--json"]);
    expect(r.code).toBe(0);
    expect(JSON.parse(r.stdout).data.streak).toBe(3);
  });

  it("context --format md imprime markdown", async () => {
    const r = await run(["context", "--format", "md"]);
    expect(r.stdout).toContain("# Contexto 2026-09-30");
    expect(r.stdout).toContain("[tsk_aaaa]");
  });

  it("saída humana não tem códigos ANSI de cor", async () => {
    const r = await run(["tasks", "list"]);
    // eslint-disable-next-line no-control-regex
    expect(r.stdout).not.toMatch(/\u001b\[/);
    expect(r.stdout).toContain("tsk_aaaa");
  });
});

describe("exit codes e erros", () => {
  it("404 da API → exit 4, stdout vazio, erro JSON no stderr", async () => {
    const r = await run(["tasks", "done", "tsk_nope", "--json"]);
    expect(r.code).toBe(4);
    expect(r.stdout).toBe("");
    expect(JSON.parse(r.stderr)).toEqual({ error: { code: "NOT_FOUND", message: "Tarefa 'tsk_nope' não encontrada" } });
  });

  it("token errado → exit 3 e o token nunca aparece na saída", async () => {
    const r = await run(["tasks", "list", "--json"], { env: { FORGE_TOKEN: "frg_wrongtoken999" } });
    expect(r.code).toBe(3);
    expect(r.stdout + r.stderr).not.toContain("frg_wrongtoken999");
    expect(JSON.parse(r.stderr).error.code).toBe("UNAUTHORIZED");
  });

  it("sem config → exit 3", async () => {
    const r = await run(["tasks", "list", "--json"], { env: { FORGE_API_URL: "", FORGE_TOKEN: "" } });
    expect(r.code).toBe(3);
    expect(JSON.parse(r.stderr).error.code).toBe("NOT_CONFIGURED");
  });

  it("uso inválido → exit 2", async () => {
    const r = await run(["tasks", "naoexiste", "--json"]);
    expect(r.code).toBe(2);
    expect(r.stdout).toBe("");
    expect(JSON.parse(r.stderr).error.code).toBe("USAGE");
  });

  it("input inválido validado pelo Zod antes de enviar → exit 2, sem request", async () => {
    const before = seen.length;
    const r = await run(["tasks", "add", "x", "--priority", "p9", "--project", "portfolio", "--json"]);
    expect(r.code).toBe(2);
    expect(seen.length).toBe(before);
  });

  it("servidor inalcançável → exit 1", async () => {
    const r = await run(["tasks", "list", "--json"], { env: { FORGE_API_URL: "http://127.0.0.1:1" } });
    expect(r.code).toBe(1);
    expect(JSON.parse(r.stderr).error.code).toBe("NETWORK");
  });
});

describe("escrita", () => {
  it("--dry-run não faz request e mostra o que seria enviado", async () => {
    const before = seen.length;
    const r = await run(["tasks", "add", "Nova", "--project", "portfolio", "--estimate", "30", "--dry-run", "--json"]);
    expect(r.code).toBe(0);
    expect(seen.length).toBe(before);
    const d = JSON.parse(r.stdout).data;
    expect(d).toMatchObject({ dryRun: true, method: "POST", path: "/api/v1/tasks", body: { title: "Nova", project: "portfolio", estimateMin: 30, source: "agent" } });
  });

  it("tasks add envia o corpo validado", async () => {
    const r = await run(["tasks", "add", "Nova", "--project", "portfolio", "--priority", "p1", "--json"]);
    expect(r.code).toBe(0);
    expect(JSON.parse(seen.at(-1)!.body)).toMatchObject({ title: "Nova", priority: "p1", source: "agent" });
  });

  it("subtasks add --stdin valida o array", async () => {
    const bad = await run(["tasks", "subtasks", "add", "tsk_aaaa", "--stdin", "--json"], { stdin: '[{"estimate":5}]' });
    expect(bad.code).toBe(2);
    const dry = await run(["tasks", "subtasks", "add", "tsk_aaaa", "--stdin", "--dry-run", "--json"], { stdin: '[{"title":"a","estimate":5}]' });
    expect(JSON.parse(dry.stdout).data.body).toEqual([{ title: "a", estimate: 5 }]);
  });
});

describe("sugestões, motivação e integrações", () => {
  it("suggestions add --stdin --dry-run valida e não envia", async () => {
    const before = seen.length;
    const r = await run(["suggestions", "add", "--stdin", "--dry-run", "--json"], { stdin: '[{"title":"Landing","project":"portfolio","reason":"parado","energy":"high","estimate":90}]' });
    expect(r.code).toBe(0);
    expect(seen.length).toBe(before);
    expect(JSON.parse(r.stdout).data.body[0]).toMatchObject({ title: "Landing", energy: "high", estimate: 90 });
  });

  it("suggestions add rejeita energia inválida (exit 2)", async () => {
    const r = await run(["suggestions", "add", "--stdin", "--json"], { stdin: '[{"title":"x","reason":"y","energy":"enorme"}]' });
    expect(r.code).toBe(2);
    expect(r.stdout).toBe("");
  });

  it("motivation set --dry-run e motivation get", async () => {
    const dry = await run(["motivation", "set", "Hoje foco no portfólio", "--dry-run", "--json"]);
    expect(JSON.parse(dry.stdout).data).toMatchObject({ dryRun: true, method: "PUT", body: { text: "Hoje foco no portfólio" } });
    const get = await run(["motivation", "get", "--json"]);
    expect(JSON.parse(get.stdout).data.source).toBe("rule");
  });

  it("motivation set com texto > 280 chars → exit 2", async () => {
    expect((await run(["motivation", "set", "x".repeat(300), "--json"])).code).toBe(2);
  });

  it("sync whoop (não integrado) → exit 5", async () => {
    const r = await run(["sync", "whoop", "--json"]);
    expect(r.code).toBe(5);
    expect(JSON.parse(r.stderr).error.code).toBe("INTEGRATION_UNAVAILABLE");
  });

  it("projects update --repo inválido → exit 2", async () => {
    expect((await run(["projects", "update", "ideario", "--repo", "sem-barra", "--json"])).code).toBe(2);
  });
});

describe("auth, schema e doctor", () => {
  it("auth login salva config com permissão 600 e não imprime o token", async () => {
    const r = await run(["auth", "login", "--url", base, "--token", TOKEN, "--json"], { env: { FORGE_API_URL: "", FORGE_TOKEN: "" } });
    expect(r.code).toBe(0);
    expect(r.stdout + r.stderr).not.toContain(TOKEN);
    const path = join(home, ".config/forge/config.json");
    expect(statSync(path).mode & 0o777).toBe(0o600);
    expect(JSON.parse(readFileSync(path, "utf8"))).toEqual({ url: base, token: TOKEN });
    // usa o arquivo quando não há env
    const list = await run(["tasks", "list", "--json"], { env: { FORGE_API_URL: "", FORGE_TOKEN: "" } });
    expect(list.code).toBe(0);
  });

  it("env tem precedência sobre o arquivo", async () => {
    const r = await run(["tasks", "list", "--json"], { env: { FORGE_TOKEN: "frg_other00000" } });
    expect(r.code).toBe(3);
  });

  it("schema tasks add imprime JSON Schema de input/output", async () => {
    const r = await run(["schema", "tasks", "add", "--json"]);
    expect(r.code).toBe(0);
    const d = JSON.parse(r.stdout).data;
    expect(d.input.properties.title).toBeDefined();
    expect(d.output.properties.id).toBeDefined();
  });

  it("schema de comando desconhecido → exit 4", async () => {
    expect((await run(["schema", "foo", "--json"])).code).toBe(4);
  });

  it("doctor ok → exit 0; token ruim → exit 3", async () => {
    const ok = await run(["doctor", "--json"]);
    expect(ok.code).toBe(0);
    expect(JSON.parse(ok.stdout).data.ok).toBe(true);
    const bad = await run(["doctor", "--json"], { env: { FORGE_TOKEN: "frg_bad000000" } });
    expect(bad.code).toBe(3);
    expect(bad.stdout + bad.stderr).not.toContain("frg_bad000000");
  });
});
