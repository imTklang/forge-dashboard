export type DayFacts = { streak: number; doneYesterday: number; openToday: number; idleProject?: { name: string; days: number } | null };

/** Mensagem do dia gerada por regras (usada quando nenhum agente escreveu uma). Sem citações genéricas. */
export function fallbackMessage(f: DayFacts): string {
  const parts: string[] = [];
  if (f.streak >= 2) parts.push(`${f.streak} dias seguidos produtivos.`);
  if (f.doneYesterday > 0) parts.push(`Ontem você concluiu ${f.doneYesterday} ${f.doneYesterday === 1 ? "tarefa" : "tarefas"}.`);
  if (f.idleProject && f.idleProject.days >= 5) parts.push(`${f.idleProject.name} está há ${f.idleProject.days} dias sem commit.`);
  if (f.openToday > 0) parts.push(`Hoje: ${f.openToday} ${f.openToday === 1 ? "tarefa aberta" : "tarefas abertas"}.`);
  if (!parts.length) parts.push("Nenhuma tarefa ainda hoje. Comece com uma pequena.");
  return parts.join(" ");
}
