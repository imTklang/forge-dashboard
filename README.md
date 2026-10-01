# Forge

Dashboard pessoal (single-user) para a vida de programador. Sem IA embutida: a plataforma é fonte de dados + UI; agentes externos (Claude Code etc.) usam a CLI `forge` para ler e escrever dados.

> Status: **Fase 5** — tarefas, projetos, GitHub, sugestões e mensagem do dia reais, com CLI `forge` quase completa. WHOOP e lembretes ainda não. Saúde (WHOOP) ainda é mock.

## Stack
Next.js 15 · TypeScript strict · Tailwind v4 · motion · Recharts · Prisma + SQLite · commander (CLI, Fase 3)

## Rodando
```bash
corepack enable
pnpm install
cp .env.example apps/web/.env      # defina FORGE_PASSWORD
cd apps/web && npx prisma db push && pnpm seed && cd ../..
pnpm dev        # http://localhost:3000 (entre com FORGE_PASSWORD)
pnpm typecheck && pnpm test
```

## CLI `forge`
```bash
pnpm --filter @forge/cli build && pnpm --filter @forge/cli link --global
forge auth login --url http://localhost:3000 --token <token da tela Configurações>
forge doctor
forge context --format md
forge tasks add "Deploy do portfólio" --project portfolio --priority p1 --estimate 45
forge tasks list --status todo,doing --json
echo '[{"title":"passo 1","estimate":10}]' | forge tasks subtasks add tsk_xxxx --stdin
forge schema tasks add      # JSON Schema do input/output
forge projects update portfolio --repo seu-usuario/seu-repo
forge sync github           # requer GITHUB_TOKEN no apps/web/.env
echo '[{"title":"Landing","project":"portfolio","reason":"parado","energy":"high","estimate":90}]' | forge suggestions add --stdin
forge motivation set "Hoje: foco no portfólio."   # sem isso, a UI usa uma mensagem por regras
forge sync whoop            # exit 5 até a integração ser ativada
```
Contrato: `--json` → stdout `{"version":1,"data":...}`; erros em stderr (`{"error":{"code","message"}}` com `--json`).
Exit codes: 0 ok · 1 erro genérico · 2 uso inválido · 3 auth · 4 não encontrado · 5 integração indisponível.
Escritas aceitam `--dry-run` e `--stdin` (validado com Zod antes de enviar). `FORGE_API_URL` e `FORGE_TOKEN` têm precedência sobre `~/.config/forge/config.json`.

## Roadmap
1. Monorepo + design system + layout mockado ✅
2. Tarefas/projetos + API v1 + auth por token ✅
3. CLI base (auth, context, tasks, doctor) ✅
4. WHOOP OAuth + sync (estrutura preparada; integração adiada)
5. GitHub + sugestões/motivação + resto da CLI ✅
6. Lembretes + AGENTS.md + skill do Claude Code

## Licença
MIT
