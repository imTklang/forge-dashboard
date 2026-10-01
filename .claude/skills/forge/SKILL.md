---
name: forge
description: Rotina da manhã do Forge — lê o contexto do dia via CLI `forge`, avalia saúde e projetos parados, cria 3–5 sugestões de trabalho de programação e escreve a mensagem do dia. Use quando o usuário pedir "rotina da manhã", "planejar meu dia", "sugestões do dia" ou mencionar a dashboard Forge.
---

# Forge — rotina da manhã

Pré-requisito: `forge doctor` sem falhas (config/API/token). Se falhar, pare e diga o que falta; não tente contornar. Leia `AGENTS.md` na raiz para o contrato completo da CLI. Use sempre `--json` e nunca imprima o token.

## Passos

1. **Contexto**: `forge context --json`. Campos úteis: `streak`, `tasks` (abertas), `projects[].idleDays`/`lastCommit`/`openIssues`, `health` (pode ser `null`), `suggestions` (já existentes), `reminders`.
2. **Avaliar**:
   - Saúde: se `health` existir, use o recovery (verde ≥ 67, amarelo 34–66, vermelho ≤ 33). Se for `null` (WHOOP não conectado), trate como energia **média** e diga isso.
   - Projetos parados: ordene por `idleDays` (maior primeiro). Projetos sem repositório (`idleDays: null`) não entram na conta.
   - Já existem sugestões hoje? Não duplique; se estiverem ruins, `forge suggestions clear` e recrie.
3. **Criar 3–5 sugestões** com um único `forge suggestions add --stdin`:
   - Recovery verde → pelo menos uma de energia `high` (feature difícil, algo que destrave um projeto).
   - Amarelo/vermelho/sem dado → trabalho leve mas útil: refactor, testes, README, deploy, post técnico (`low`/`medium`).
   - **Sempre ≥ 1 para o projeto `portfolio`.**
   - Cada item: `title` específico, `project` (slug), `reason` citando um dado real (ex.: "9 dias sem commit"), `estimate` em minutos, `energy`.
   - Valide com `--dry-run` primeiro se tiver dúvida do formato (`forge schema suggestions add`).
4. **Mensagem do dia**: `forge motivation set "<texto>"` — até 280 caracteres, concreta e baseada em dados (streak, projeto parado, tarefa pendente). Sem citações genéricas.
5. **Fechar**: responda ao usuário com um resumo curto (o que foi sugerido e por quê). Não crie tarefas diretamente: o usuário decide pelo botão "Adicionar ao checklist".

## Exemplo

```bash
forge context --json
echo '[
  {"title":"Landing de cases no Portfólio","project":"portfolio","reason":"743 dias sem commit","estimate":90,"energy":"high"},
  {"title":"README do GASBRAS com setup","project":"gasbras","reason":"23 dias parado; tarefa leve","estimate":30,"energy":"low"},
  {"title":"Testes do service de streak","project":"ideario","reason":"cobertura baixa","estimate":60,"energy":"medium"}
]' | forge suggestions add --stdin --json
forge motivation set "6 dias seguidos. O Portfólio está parado há semanas: hoje é dia de publicar a landing." --json
```

## Erros comuns
- exit `3`: token inválido/revogado → peça um novo em `/configuracoes`.
- exit `4`: slug de projeto inexistente → confira `forge projects list`.
- exit `2`: JSON fora do schema → leia `error.message` e ajuste.
- exit `5`: integração indisponível (WHOOP/GitHub) → siga sem esses dados.
