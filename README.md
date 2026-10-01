# Forge

Dashboard pessoal (single-user) para a vida de programador. Sem IA embutida: a plataforma é fonte de dados + UI; agentes externos (Claude Code etc.) usam a CLI `forge` para ler e escrever dados.

> Status: **Fase 1** — monorepo, design system e layout com dados mockados. Veja o roadmap abaixo.

## Stack
Next.js 15 · TypeScript strict · Tailwind v4 · motion · Recharts · Prisma/PostgreSQL (Fase 2) · commander (CLI, Fase 3)

## Rodando
```bash
corepack enable
pnpm install
pnpm dev        # http://localhost:3000
pnpm typecheck && pnpm test
```

## Roadmap
1. Monorepo + design system + layout mockado ✅
2. Tarefas/projetos + API v1 + auth por token
3. CLI base (auth, context, tasks, doctor)
4. WHOOP OAuth + sync (estrutura preparada; integração adiada)
5. GitHub + sugestões/motivação + resto da CLI
6. Lembretes + AGENTS.md + skill do Claude Code

## Licença
MIT
