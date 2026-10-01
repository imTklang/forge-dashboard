import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

// ---------- erros e exit codes ----------
export const EXIT = { OK: 0, GENERIC: 1, USAGE: 2, AUTH: 3, NOT_FOUND: 4, INTEGRATION: 5 } as const;

export class CliError extends Error {
  constructor(public code: string, message: string, public exit: number = EXIT.GENERIC) {
    super(message);
  }
}

const API_EXIT: Record<string, number> = {
  UNAUTHORIZED: EXIT.AUTH,
  FORBIDDEN: EXIT.AUTH,
  NOT_FOUND: EXIT.NOT_FOUND,
  BAD_REQUEST: EXIT.USAGE,
  INTEGRATION_UNAVAILABLE: EXIT.INTEGRATION,
};

// ---------- config ----------
export type Config = { url?: string; token?: string };

export const configPath = () => join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "forge", "config.json");

export function readConfig(): Config {
  const path = configPath();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8")) as Config;
  } catch {
    throw new CliError("BAD_CONFIG", `Config inválida em ${path}`, EXIT.GENERIC);
  }
}

export function saveConfig(cfg: Config) {
  const path = configPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(cfg, null, 2), { mode: 0o600 });
  chmodSync(path, 0o600);
  return path;
}

/** Variáveis de ambiente têm precedência sobre o arquivo. */
export function resolveConfig(): Config {
  const file = readConfig();
  return { url: process.env.FORGE_API_URL || file.url, token: process.env.FORGE_TOKEN || file.token };
}

// ---------- HTTP ----------
export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { url, token } = resolveConfig();
  if (!url || !token) throw new CliError("NOT_CONFIGURED", "Não configurado. Rode: forge auth login --url <api> --token <token>", EXIT.AUTH);
  let res: Response;
  try {
    res = await fetch(new URL(`/api/v1${path}`, url), {
      method,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new CliError("NETWORK", `Não foi possível conectar a ${url}`, EXIT.GENERIC);
  }
  const json = (await res.json().catch(() => null)) as { data?: T; error?: { code: string; message: string } } | null;
  if (!res.ok || !json || json.error) {
    const code = json?.error?.code ?? "HTTP_ERROR";
    throw new CliError(code, json?.error?.message ?? `HTTP ${res.status}`, API_EXIT[code] ?? EXIT.GENERIC);
  }
  return json.data as T;
}

// ---------- saída ----------
/** stdout: só dados. */
export function printData(data: unknown, json: boolean, human: () => string) {
  process.stdout.write(json ? `${JSON.stringify({ version: 1, data })}\n` : `${human()}\n`);
}

/** stderr: erros e logs. */
export function printError(err: CliError, json: boolean) {
  process.stderr.write(json ? `${JSON.stringify({ error: { code: err.code, message: err.message } })}\n` : `erro: ${err.message}\n`);
}

export function table(rows: string[][]): string {
  const widths = rows[0]?.map((_, i) => Math.max(...rows.map((r) => (r[i] ?? "").length))) ?? [];
  return rows.map((r) => r.map((c, i) => (i === r.length - 1 ? c : c.padEnd(widths[i] ?? 0))).join("  ")).join("\n");
}

export async function readStdinJson(): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new CliError("BAD_REQUEST", "stdin não contém JSON válido", EXIT.USAGE);
  }
}
