# Forge

Dashboard pessoal (single-user) para organizar a vida de programador. **Sem IA embutida**: a plataforma é a fonte de dados e a interface; agentes externos (Claude Code e similares) usam a CLI `forge` para ler o contexto e escrever de volta tarefas, sugestões e a mensagem do dia. Veja [`AGENTS.md`](AGENTS.md).

- **UI**: glassmorphism com destaque laranja, checklist com drag-and-drop, sugestões, projetos com dados do GitHub, streak + heatmap, lembretes com notificação.
- **API REST** `/api/v1` com token pessoal (`read` / `write`).
- **CLI `forge`** com saída `--json` estável, exit codes documentados e 100% não interativa.

## Stack
Next.js 15 (App Router) · TypeScript strict · Tailwind v4 · shadcn/ui · motion · Recharts · Prisma + SQLite · commander + tsup · Zod · Vitest · pnpm workspaces

```
apps/web        UI + API (/api/v1)
packages/core   schemas Zod compartilhados (API e CLI)
packages/cli    CLI `forge`
```

## Começando
```bash
corepack enable
pnpm install
cp .env.example apps/web/.env          # defina FORGE_PASSWORD
cd apps/web && npx prisma db push && pnpm seed && cd ../..
pnpm dev                               # http://localhost:3000
```
Entre com `FORGE_PASSWORD`, abra **Configurações** e gere um token para a CLI.

```bash
pnpm --filter @forge/cli build && pnpm --filter @forge/cli link --global
forge auth login --url http://localhost:3000 --token <token>
forge doctor
```

Testes e checagens: `pnpm lint && pnpm typecheck && pnpm test`.

## Design system
- **Componentes**: shadcn/ui (`apps/web/src/components/ui`). Adicione novos com `pnpm dlx shadcn@latest add <componente>` dentro de `apps/web`.
- **Paleta e tipografia**: tokens em `apps/web/src/app/globals.css` (tema escuro único, acento laranja, verde/âmbar/vermelho só para status). Fonte: Bricolage Grotesque, pesos 400 / 500 / 600.
- **Lint de design system**: `@shadcn/lint` (via Oxlint, `apps/web/.oxlintrc.json`) com as seis regras ligadas: `no-restyle` (só layout pode ser ajustado via `className`), `no-raw-colors`, `no-arbitrary-values`, `no-inline-styles`, `no-unknown-classes` e `require-static-classes`. Os componentes de `src/components/ui` são a fonte da verdade e ficam fora da checagem. Precisa de uma variação nova? Crie uma *variant* no componente (ex.: `Button variant="quiet"`, `Card variant="highlight"`) em vez de passar classes. Rode com `pnpm lint`.
- **Diretrizes de interface**: a UI foi revisada contra as [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) (acessibilidade, foco, formulários, movimento reduzido, tipografia).

## CLI em 30 segundos
```bash
forge context --format md                       # snapshot do dia
forge tasks add "Deploy do portfólio" --project portfolio --priority p1 --estimate 45
forge tasks list --status todo,doing --json
echo '[{"title":"passo 1","estimate":10}]' | forge tasks subtasks add tsk_xxxx --stdin
forge projects update portfolio --repo seu-usuario/seu-repo
forge sync github                               # requer GITHUB_TOKEN
echo '[{"title":"Landing","project":"portfolio","reason":"parado","energy":"high","estimate":90}]' | forge suggestions add --stdin
forge motivation set "Hoje: foco no portfólio."
forge reminders add "Revisar PRs" --at 14:30 --repeat weekdays
forge schema tasks add                          # JSON Schema de input/output
```
Contrato: `--json` → stdout `{"version":1,"data":...}`; erros no stderr. Exit codes: `0` ok · `1` genérico · `2` uso inválido · `3` auth · `4` não encontrado · `5` integração indisponível. Escritas aceitam `--dry-run` e `--stdin`.

## Integrações

### GitHub
Crie um token pessoal com acesso de leitura aos repositórios, ponha em `GITHUB_TOKEN` (`apps/web/.env`), associe os repositórios (`forge projects update <slug> --repo dono/nome`) e rode `forge sync github`.

### Lembretes e notificações (Web Push)
```bash
pnpm --filter @forge/web vapid     # copie as chaves para VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
```
Reinicie o servidor, abra **Configurações → Ativar neste dispositivo**. Um scheduler interno confere os lembretes a cada minuto (requer o servidor rodando; fuso America/Fortaleza). Web Push exige HTTPS em produção (em `localhost` funciona).

### WHOOP (futuro — ainda não integrado)
A estrutura (`forge health`, `forge sync whoop`, campos de saúde no `context`) já existe e responde "integração indisponível" (exit 5). Quando for ativar:

1. Crie um app em <https://developer-dashboard.whoop.com>.
2. Cadastre o redirect URI `http://localhost:3000/api/whoop/callback`.
3. Escopos: `read:recovery read:sleep read:cycles read:workout read:profile read:body_measurement offline`.
4. Preencha `WHOOP_CLIENT_ID` / `WHOOP_CLIENT_SECRET` no `.env`.

Os cards de Saúde da UI exibem dados de exemplo até lá.

## Roadmap
1. Monorepo + design system + layout ✅
2. Tarefas/projetos + API v1 + auth por token ✅
3. CLI base ✅
4. WHOOP OAuth + sync (adiado)
5. GitHub + sugestões/motivação + resto da CLI ✅
6. Lembretes + AGENTS.md + skill ✅

## Segurança
Projeto de uso pessoal: senha única na UI (cookie httpOnly) e tokens Bearer salvos apenas como hash SHA-256. Não exponha a instância na internet sem HTTPS. Nunca commite `.env`.

## Licença
MIT
