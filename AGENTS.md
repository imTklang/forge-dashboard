# Forge — guia para agentes

Forge é a dashboard pessoal de programador do Enzo. **Não tem IA embutida**: ela guarda os dados (tarefas, projetos, GitHub, lembretes) e mostra a UI. Você, o agente, lê o estado e escreve de volta (tarefas, subtarefas, sugestões, mensagem do dia) pela CLI `forge`. A CLI só fala com a API HTTP; nunca acessa o banco.

Escopo: **apenas trabalho de programação** (projetos, portfólio, estudos técnicos).

## Instalação e acesso
```bash
pnpm --filter @forge/cli build && pnpm --filter @forge/cli link --global
forge auth login --url http://localhost:3000 --token <token>   # token gerado em /configuracoes
forge doctor                                                   # confere config, API, token, integrações
```
`FORGE_API_URL` e `FORGE_TOKEN` (env) têm precedência sobre `~/.config/forge/config.json`. Nunca imprima nem registre o token.

## Contrato de saída
- Use sempre `--json`. stdout = `{"version":1,"data":...}` e **nada além disso**. Logs e erros vão para stderr.
- Erro com `--json`: `{"error":{"code":"NOT_FOUND","message":"..."}}` no stderr.
- Exit codes: `0` ok · `1` erro genérico/rede · `2` uso ou input inválido · `3` auth · `4` não encontrado · `5` integração indisponível.
- Nenhum prompt, cor ou spinner. Datas ISO 8601 (`YYYY-MM-DD`), fuso America/Fortaleza. IDs curtos (`tsk_8f2k`, `sug_k2p1`, `rem_ab12`).
- Escritas aceitam `--dry-run` (mostra o request sem enviar). Entradas JSON vêm por `--stdin` e são validadas antes do envio.
- `forge schema <comando>` imprime o JSON Schema de entrada/saída, ex.: `forge schema suggestions add`.

## Comandos
| Área | Comandos |
|---|---|
| Contexto | `forge context [--date D] [--format md] [--verbose]` |
| Tarefas | `tasks list [--date today] [--status todo,doing] [--project slug]` · `tasks add "título" --project slug [--priority p1] [--estimate 45] [--date D]` · `tasks update <id> [--title --project --priority --estimate --status --date]` · `tasks done <id>` · `tasks defer <id>` · `tasks subtasks add <id> --stdin` (`[{"title","estimate"}]`) |
| Projetos | `projects list` · `projects show <slug>` · `projects update <slug> --repo dono/nome` |
| Sugestões | `suggestions list [--date D]` · `suggestions add --stdin` (`[{"title","project","reason","estimate","energy":"high\|medium\|low"}]`) · `suggestions clear [--date D]` |
| Mensagem do dia | `motivation set "texto"` (máx. 280) · `motivation get` |
| Lembretes | `reminders list` · `reminders add "texto" --at HH:mm [--repeat daily\|weekdays\|none]` · `reminders remove <id>` |
| Saúde | `health today` · `health history --days 30 [--metrics recovery,hrv,sleep,strain]` — **WHOOP ainda não integrado: retorna exit 5** |
| Sync | `sync github` · `sync whoop` (exit 5 por enquanto) |

## Regras de conduta
- Tarefas criadas pela CLI são marcadas como origem "agente" e a UI mostra o selo "via agente". Não faça passar por manuais.
- Tarefas não concluídas viram `deferred` no dia seguinte automaticamente; não recrie.
- Não apague tarefas do usuário. Prefira `defer`/`update`. Use `--dry-run` em dúvida.
- Se `health` retornar exit 5, siga sem dados de saúde e diga isso na mensagem/raciocínio; não invente valores.
- Mensagem do dia: curta, concreta, baseada em dados reais (streak, projetos parados, tarefas). Sem citações genéricas.

## Fluxo recomendado (rotina da manhã)
Há uma skill pronta: `.claude/skills/forge/SKILL.md`. Resumo:
1. `forge context --json`
2. Avaliar recovery (se houver) e projetos parados (`idleDays`).
3. Criar 3–5 sugestões com `forge suggestions add --stdin` (≥1 para o Portfólio).
4. `forge motivation set "..."`.
