# Forge

Dashboard pessoal (single-user) para a vida de programador. Sem IA embutida: a plataforma é fonte de dados + UI; agentes externos (Claude Code etc.) usam a CLI `forge` para ler e escrever dados.

> Status: **Fase 2** — tarefas/projetos reais, API `/api/v1` com token e login por senha. Saúde (WHOOP) ainda é mock.

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

## Roadmap
1. Monorepo + design system + layout mockado ✅
2. Tarefas/projetos + API v1 + auth por token ✅
3. CLI base (auth, context, tasks, doctor)
4. WHOOP OAuth + sync (estrutura preparada; integração adiada)
5. GitHub + sugestões/motivação + resto da CLI
6. Lembretes + AGENTS.md + skill do Claude Code

## Licença
MIT
