import { Command, CommanderError } from "commander";
import { z } from "zod";
import { Context, Motivation, MotivationSet, ProjectSummary, ProjectUpdate, Suggestion, SuggestionInput, SubtasksInput, Task, TaskCreate, TaskUpdate } from "@forge/core";
import { CliError, EXIT, configPath, printData, printError, readStdinJson, request, resolveConfig, saveConfig, table } from "./lib";

type T = z.infer<typeof Task>;

const program = new Command("forge")
  .description("CLI do Forge: lê e escreve dados da dashboard. Use --json para saída estável.")
  .version("0.1.0")
  .option("--json", "saída JSON {\"version\":1,\"data\":...}");
const json = () => Boolean(program.opts().json);

/** Parse com Zod; falha vira erro de uso (exit 2). */
function parse<S extends z.ZodType>(schema: S, value: unknown): z.infer<S> {
  const r = schema.safeParse(value);
  if (!r.success) throw new CliError("BAD_REQUEST", r.error.issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`).join("; "), EXIT.USAGE);
  return r.data;
}

const int = (v: string | undefined, name: string) => {
  if (v === undefined) return undefined;
  const n = Number(v);
  if (!Number.isInteger(n)) throw new CliError("BAD_REQUEST", `${name} deve ser um inteiro`, EXIT.USAGE);
  return n;
};

/** Envia a escrita, ou só mostra o que seria enviado com --dry-run. */
async function write<R>(opts: { dryRun?: boolean }, method: string, path: string, body: unknown): Promise<R | { dryRun: true; method: string; path: string; body: unknown }> {
  if (opts.dryRun) return { dryRun: true, method, path: `/api/v1${path}`, body };
  return request<R>(method, path, body);
}

const taskLine = (t: T) => [t.id, t.priority, t.status, t.project, t.estimateMin ? `${t.estimateMin}m` : "-", t.title];
const taskTable = (ts: T[]) => (ts.length ? table([["ID", "PRIO", "STATUS", "PROJETO", "EST", "TÍTULO"], ...ts.map(taskLine)]) : "(nenhuma tarefa)");
const showWrite = (d: unknown) => (d && typeof d === "object" && "dryRun" in d ? `[dry-run] ${JSON.stringify(d)}` : (() => { const t = d as T; return `${t.id}  ${t.status}  ${t.title}`; })());

// ---------- auth ----------
program
  .command("auth")
  .description("Configuração de acesso")
  .command("login")
  .description("Salva URL e token em ~/.config/forge/config.json (perm. 600)")
  .requiredOption("--url <url>", "URL base da API")
  .requiredOption("--token <token>", "token pessoal")
  .action((o: { url: string; token: string }) => {
    try {
      new URL(o.url);
    } catch {
      throw new CliError("BAD_REQUEST", "URL inválida", EXIT.USAGE);
    }
    const path = saveConfig({ url: o.url, token: o.token });
    printData({ url: o.url, configPath: path }, json(), () => `Salvo em ${path}`);
  });

// ---------- context ----------
function contextMd(c: Context) {
  const byProject = new Map<string, T[]>();
  for (const t of c.tasks) byProject.set(t.project, [...(byProject.get(t.project) ?? []), t]);
  const lines = [`# Contexto ${c.date}`, "", `Streak: ${c.streak} dia(s)`, "", "## Tarefas abertas"];
  if (!byProject.size) lines.push("(nenhuma)");
  for (const [p, ts] of byProject) {
    lines.push(`### ${p}`);
    for (const t of ts) lines.push(`- [${t.id}] ${t.priority} ${t.status} ${t.title}${t.estimateMin ? ` (${t.estimateMin}m)` : ""}`);
  }
  lines.push("", "## Projetos", ...c.projects.map((p) => `- ${p.slug}: ${p.openTasks} abertas${p.idleDays !== null ? `, ${p.idleDays}d sem commit` : ""}${p.lastCommit ? ` (último: ${p.lastCommit.message})` : ""}`));
  lines.push("", `Mensagem do dia (${c.motivation.source === "agent" ? "agente" : "regra"}): ${c.motivation.text}`);
  lines.push("", "## Sugestões já existentes", ...(c.suggestions.length ? c.suggestions.map((x) => `- [${x.id}] ${x.title} (${x.energy}${x.accepted ? ", aceita" : ""})`) : ["(nenhuma)"]));
  lines.push("", `Saúde: ${c.health ? "disponível" : "sem dados (WHOOP não conectado)"}`);
  return lines.join("\n");
}

program
  .command("context")
  .description("Snapshot do dia para agentes")
  .option("--date <YYYY-MM-DD>", "dia (padrão: hoje)")
  .option("--format <fmt>", "text | md", "text")
  .option("--verbose", "inclui detalhes extras")
  .action(async (o: { date?: string; format: string; verbose?: boolean }) => {
    const c = parse(Context, await request("GET", `/context${o.date ? `?date=${o.date}` : ""}`));
    printData(c, json(), () => (o.format === "md" ? contextMd(c) : [`${c.date}  streak ${c.streak}`, taskTable(c.tasks), "", table([["PROJETO", "ABERTAS"], ...c.projects.map((p) => [p.slug, String(p.openTasks)])])].join("\n")));
  });

// ---------- tasks ----------
const tasks = program.command("tasks").description("Tarefas");

tasks
  .command("list")
  .option("--date <date>", "YYYY-MM-DD ou today")
  .option("--status <list>", "ex.: todo,doing")
  .option("--project <slug>")
  .action(async (o: { date?: string; status?: string; project?: string }) => {
    const q = new URLSearchParams(Object.entries(o).filter(([, v]) => v) as [string, string][]).toString();
    const list = parse(z.array(Task), await request("GET", `/tasks${q ? `?${q}` : ""}`));
    printData(list, json(), () => taskTable(list));
  });

tasks
  .command("add [title]")
  .description("Cria tarefa (ou use --stdin com JSON)")
  .option("--project <slug>")
  .option("--priority <p1|p2|p3>", "prioridade")
  .option("--estimate <min>", "estimativa em minutos")
  .option("--date <YYYY-MM-DD>")
  .option("--stdin", "lê JSON de stdin")
  .option("--dry-run")
  .action(async (title: string | undefined, o: Record<string, string | boolean | undefined>) => {
    const raw = o.stdin ? await readStdinJson() : { title, project: o.project, priority: o.priority, estimateMin: int(o.estimate as string | undefined, "--estimate"), date: o.date };
    const body = parse(TaskCreate, { source: "agent", ...(raw as object) });
    const out = await write<T>({ dryRun: !!o.dryRun }, "POST", "/tasks", body);
    printData(out, json(), () => showWrite(out));
  });

tasks
  .command("update <id>")
  .description("Atualiza campos (ou use --stdin com JSON)")
  .option("--title <t>")
  .option("--project <slug>")
  .option("--priority <p>")
  .option("--estimate <min>")
  .option("--status <s>", "todo|doing|done|deferred")
  .option("--date <d>")
  .option("--stdin")
  .option("--dry-run")
  .action(async (id: string, o: Record<string, string | boolean | undefined>) => {
    const raw = o.stdin ? await readStdinJson() : { title: o.title, project: o.project, priority: o.priority, estimateMin: int(o.estimate as string | undefined, "--estimate"), status: o.status, date: o.date };
    const body = parse(TaskUpdate, JSON.parse(JSON.stringify(raw)));
    if (!Object.keys(body).length) throw new CliError("BAD_REQUEST", "Nada para atualizar", EXIT.USAGE);
    const out = await write<T>({ dryRun: !!o.dryRun }, "PATCH", `/tasks/${id}`, body);
    printData(out, json(), () => showWrite(out));
  });

for (const [name, desc] of [["done", "Conclui a tarefa"], ["defer", "Adia a tarefa para amanhã"]] as const) {
  tasks
    .command(`${name} <id>`)
    .description(desc)
    .option("--dry-run")
    .action(async (id: string, o: { dryRun?: boolean }) => {
      const out = await write<T>(o, "POST", `/tasks/${id}/${name}`, undefined);
      printData(out, json(), () => showWrite(out));
    });
}

tasks
  .command("subtasks")
  .description("Subtarefas")
  .command("add <id>")
  .description('Adiciona subtarefas via --stdin: [{"title":"...","estimate":15}]')
  .requiredOption("--stdin", "lê array JSON de stdin")
  .option("--dry-run")
  .action(async (id: string, o: { dryRun?: boolean }) => {
    const body = parse(SubtasksInput, await readStdinJson());
    const out = await write<T>(o, "POST", `/tasks/${id}/subtasks`, body);
    printData(out, json(), () => showWrite(out));
  });

// ---------- projects ----------
const projects = program.command("projects").description("Projetos");
projects.command("list").action(async () => {
  const list = parse(z.array(ProjectSummary), await request("GET", "/projects"));
  printData(list, json(), () => table([["SLUG", "ABERTAS", "PARADO", "ISSUES", "REPO"], ...list.map((p) => [p.slug, String(p.openTasks), p.idleDays === null ? "-" : `${p.idleDays}d`, String(p.openIssues), p.repo ?? "-"])]));
});
projects.command("show <slug>").action(async (slug: string) => {
  const p = await request<{ name: string; openTasks: { id: string; title: string; status: string; priority: string }[] }>("GET", `/projects/${slug}`);
  printData(p, json(), () => [p.name, ...p.openTasks.map((t) => `  ${t.id}  ${t.priority}  ${t.status}  ${t.title}`)].join("\n"));
});

projects
  .command("update <slug>")
  .description("Define o repositório GitHub (owner/nome, ou 'none' para remover)")
  .requiredOption("--repo <owner/nome>")
  .option("--dry-run")
  .action(async (slug: string, o: { repo: string; dryRun?: boolean }) => {
    const body = parse(ProjectUpdate, { repo: o.repo === "none" ? null : o.repo });
    const out = await write<{ slug: string; repo: string | null }>(o, "PATCH", `/projects/${slug}`, body);
    printData(out, json(), () => ("dryRun" in out ? `[dry-run] ${JSON.stringify(out)}` : `${out.slug}  ${out.repo ?? "(sem repo)"}`));
  });

// ---------- suggestions ----------
type Sug = z.infer<typeof Suggestion>;
const suggestions = program.command("suggestions").description("Sugestões do dia (escritas por agentes)");

suggestions
  .command("list")
  .option("--date <YYYY-MM-DD>")
  .action(async (o: { date?: string }) => {
    const list = parse(z.array(Suggestion), await request("GET", `/suggestions${o.date ? `?date=${o.date}` : ""}`));
    printData(list, json(), () => (list.length ? table([["ID", "ENERGIA", "PROJETO", "EST", "TÍTULO"], ...list.map((x) => [x.id, x.energy, x.project ?? "-", x.estimateMin ? `${x.estimateMin}m` : "-", x.title])]) : "(nenhuma sugestão)"));
  });

suggestions
  .command("add")
  .description('Adiciona sugestões via --stdin: [{"title","project","reason","estimate","energy"}]')
  .requiredOption("--stdin", "lê array JSON de stdin")
  .option("--dry-run")
  .action(async (o: { dryRun?: boolean }) => {
    const body = parse(SuggestionInput, await readStdinJson());
    const out = await write<Sug[]>(o, "POST", "/suggestions", body);
    printData(out, json(), () => (Array.isArray(out) ? out.map((x) => `${x.id}  ${x.title}`).join("\n") : `[dry-run] ${JSON.stringify(out)}`));
  });

suggestions
  .command("clear")
  .option("--date <YYYY-MM-DD>")
  .option("--dry-run")
  .action(async (o: { date?: string; dryRun?: boolean }) => {
    const out = await write<{ deleted: number }>(o, "DELETE", `/suggestions${o.date ? `?date=${o.date}` : ""}`, undefined);
    printData(out, json(), () => ("dryRun" in out ? `[dry-run] ${JSON.stringify(out)}` : `${out.deleted} removida(s)`));
  });

// ---------- motivation ----------
const motivation = program.command("motivation").description("Mensagem do dia");
motivation
  .command("set <text>")
  .option("--date <YYYY-MM-DD>")
  .option("--dry-run")
  .action(async (text: string, o: { date?: string; dryRun?: boolean }) => {
    const body = parse(MotivationSet, { text, date: o.date });
    const out = await write<z.infer<typeof Motivation>>(o, "PUT", "/motivation", body);
    printData(out, json(), () => ("dryRun" in out ? `[dry-run] ${JSON.stringify(out)}` : out.text));
  });
motivation
  .command("get")
  .option("--date <YYYY-MM-DD>")
  .action(async (o: { date?: string }) => {
    const m = parse(Motivation, await request("GET", `/motivation${o.date ? `?date=${o.date}` : ""}`));
    printData(m, json(), () => `${m.text}  (${m.source === "agent" ? "via agente" : "regra"})`);
  });

// ---------- health (WHOOP; indisponível até a integração) ----------
const health = program.command("health").description("Saúde (WHOOP)");
health.command("today").action(async () => {
  const d = await request<unknown>("GET", "/health/today");
  printData(d, json(), () => JSON.stringify(d, null, 2));
});
health
  .command("history")
  .option("--days <n>", "janela em dias", "30")
  .option("--metrics <list>", "recovery,hrv,sleep,strain")
  .action(async (o: { days: string; metrics?: string }) => {
    const days = int(o.days, "--days");
    const d = await request<unknown>("GET", `/health/history?days=${days}${o.metrics ? `&metrics=${o.metrics}` : ""}`);
    printData(d, json(), () => JSON.stringify(d, null, 2));
  });

// ---------- sync ----------
const sync = program.command("sync").description("Sincroniza integrações");
sync.command("github").action(async () => {
  const d = await request<{ synced: number; results: { slug: string; ok: boolean; error?: string }[] }>("POST", "/sync/github");
  printData(d, json(), () => [`${d.synced} projeto(s) sincronizado(s)`, ...d.results.filter((r) => !r.ok).map((r) => `  falhou ${r.slug}: ${r.error}`)].join("\n"));
});
sync.command("whoop").action(async () => {
  const d = await request<unknown>("POST", "/sync/whoop");
  printData(d, json(), () => JSON.stringify(d));
});

// ---------- schema ----------
const SCHEMAS: Record<string, { input?: z.ZodType; output: z.ZodType }> = {
  context: { output: Context },
  "tasks list": { output: z.array(Task) },
  "tasks add": { input: TaskCreate, output: Task },
  "tasks update": { input: TaskUpdate, output: Task },
  "tasks done": { output: Task },
  "tasks defer": { output: Task },
  "tasks subtasks add": { input: SubtasksInput, output: Task },
  "projects list": { output: z.array(ProjectSummary) },
  "projects update": { input: ProjectUpdate, output: ProjectSummary },
  "suggestions list": { output: z.array(Suggestion) },
  "suggestions add": { input: SuggestionInput, output: z.array(Suggestion) },
  "motivation set": { input: MotivationSet, output: Motivation },
  "motivation get": { output: Motivation },
};

program
  .command("schema <command...>")
  .description('JSON Schema de input/output de um comando, ex.: forge schema tasks add')
  .action((parts: string[]) => {
    const key = parts.join(" ");
    const s = SCHEMAS[key];
    if (!s) throw new CliError("NOT_FOUND", `Sem schema para '${key}'. Disponíveis: ${Object.keys(SCHEMAS).join(", ")}`, EXIT.NOT_FOUND);
    const out = { command: key, input: s.input ? z.toJSONSchema(s.input) : null, output: z.toJSONSchema(s.output) };
    printData(out, json(), () => JSON.stringify(out, null, 2));
  });

// ---------- doctor ----------
program
  .command("doctor")
  .description("Checa config, conexão, token e integrações")
  .action(async () => {
    const { url, token } = resolveConfig();
    const checks: { name: string; ok: boolean; detail: string }[] = [];
    let exit: number = EXIT.OK;
    checks.push({ name: "config", ok: !!url && !!token, detail: url && token ? `url=${url} (config: ${configPath()})` : "url/token ausentes" });
    if (!url || !token) exit = EXIT.AUTH;
    else {
      try {
        const h = await request<{ integrations: Record<string, string> }>("GET", "/health");
        checks.push({ name: "api", ok: true, detail: "conectou" }, { name: "token", ok: true, detail: "válido" });
        for (const [k, v] of Object.entries(h.integrations)) checks.push({ name: `integração:${k}`, ok: v === "ok" || v === "not_configured", detail: v });
      } catch (e) {
        const err = e as CliError;
        const authFail = err.exit === EXIT.AUTH;
        checks.push({ name: "api", ok: authFail, detail: authFail ? "conectou" : err.message }, { name: "token", ok: false, detail: authFail ? err.message : "não verificado" });
        exit = err.exit;
      }
    }
    printData({ ok: exit === EXIT.OK, checks }, json(), () => checks.map((c) => `${c.ok ? "ok  " : "FAIL"}  ${c.name}: ${c.detail}`).join("\n"));
    process.exitCode = exit;
  });

// ---------- execução ----------
const silence = (c: Command) => {
  c.exitOverride().configureOutput({ writeErr: () => {}, outputError: () => {} });
  c.commands.forEach(silence);
};
silence(program);

try {
  await program.parseAsync(process.argv);
} catch (e) {
  const wantsJson = process.argv.includes("--json");
  if (e instanceof CommanderError) {
    if (e.exitCode === 0) process.exit(0); // --help / --version
    printError(new CliError("USAGE", e.message.replace(/^error: /, ""), EXIT.USAGE), wantsJson);
    process.exit(EXIT.USAGE);
  }
  if (e instanceof CliError) {
    printError(e, wantsJson);
    process.exit(e.exit);
  }
  printError(new CliError("INTERNAL", "Erro inesperado", EXIT.GENERIC), wantsJson);
  process.exit(EXIT.GENERIC);
}
