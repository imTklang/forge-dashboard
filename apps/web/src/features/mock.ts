// Dados mockados da Fase 1. Substituídos por services/API na Fase 2+.
export const mock = {
  user: { name: "Enzo", handle: "@enzogabriel", weightKg: 78, heightCm: 178, streak: 6 },
  stats: [
    { key: "recovery", title: "Recovery", value: 72, unit: "%", color: "#34d399", chart: [55, 62, 48, 70, 66, 74, 72] },
    { key: "hrv", title: "HRV", value: 68, unit: "ms", color: "#f87171", chart: [60, 64, 58, 66, 71, 65, 68] },
    { key: "sleep", title: "Sono", value: 7.4, unit: "h", decimals: 1, color: "#60a5fa", chart: [6.5, 7, 6.8, 7.9, 7.2, 7.1, 7.4] },
    { key: "strain", title: "Strain", value: 11.8, unit: "", decimals: 1, color: "#ff6b1a", chart: [9, 12, 14, 8, 13, 10, 11.8] },
  ],
  trend30: Array.from({ length: 30 }, (_, i) => ({
    d: i + 1,
    recovery: Math.round(60 + 15 * Math.sin(i / 3) + (i % 5)),
    hrv: Math.round(62 + 8 * Math.cos(i / 4)),
  })),
  sleepStages: [
    { name: "Leve", min: 220, color: "#60a5fa" },
    { name: "Profundo", min: 95, color: "#6366f1" },
    { name: "REM", min: 110, color: "#a78bfa" },
    { name: "Acordado", min: 19, color: "#64748b" },
  ],
  message: { text: "6 dias seguidos produtivos. Recovery verde: hoje vale atacar o Portfólio.", at: "07:42" },
  tasks: [
    { id: "tsk_8f2k", title: "Deploy do Portfólio na Vercel", project: "Portfólio", priority: "p1", estimate: 45, status: "doing", source: "agent" },
    { id: "tsk_a1c9", title: "Testes do service de streak", project: "Ideario", priority: "p2", estimate: 60, status: "todo", source: "manual" },
    { id: "tsk_m3x7", title: "Refatorar auth do AGU", project: "AGU", priority: "p2", estimate: 90, status: "todo", source: "agent" },
    { id: "tsk_q8d2", title: "README do LocFly", project: "LocFly", priority: "p3", estimate: 30, status: "done", source: "manual" },
  ],
  suggestions: [
    { id: "sug_k2p1", title: "Landing de cases no Portfólio", project: "Portfólio", reason: "Recovery verde + 9 dias sem commit", estimate: 90, energy: "high", at: "07:42" },
    { id: "sug_z9w4", title: "Cobrir rotas do GASBRAS com testes", project: "GASBRAS", reason: "Trabalho útil e de baixo esforço", estimate: 45, energy: "low", at: "07:42" },
  ],
  projects: [
    { slug: "ideario", name: "Ideario", idle: 1, lastCommit: "feat: editor de notas", week: 12, issues: 3, color: "#ff6b1a" },
    { slug: "agu", name: "AGU", idle: 3, lastCommit: "fix: guard de rotas", week: 5, issues: 1, color: "#60a5fa" },
    { slug: "gasbras", name: "GASBRAS", idle: 6, lastCommit: "chore: deps", week: 1, issues: 4, color: "#34d399" },
    { slug: "arremex", name: "Arremex", idle: 12, lastCommit: "docs: setup", week: 0, issues: 0, color: "#a78bfa" },
    { slug: "locfly", name: "LocFly", idle: 2, lastCommit: "feat: busca de voos", week: 8, issues: 2, color: "#fbbf24" },
    { slug: "portfolio", name: "Portfólio", idle: 9, lastCommit: "style: hero", week: 0, issues: 1, color: "#f87171" },
  ],
  scheduled: [
    { id: "rem_1", text: "Beber água e alongar", time: "10:00", repeat: "Diário" },
    { id: "rem_2", text: "Revisar PRs abertos", time: "14:30", repeat: "Dias úteis" },
    { id: "rem_3", text: "Resumo do dia", time: "21:00", repeat: "Diário" },
  ],
  /** dia do mês -> tarefas concluídas (heatmap) */
  heat: { 1: 1, 2: 3, 3: 2, 5: 1, 6: 4, 8: 2, 9: 1, 10: 3, 12: 5, 13: 2, 15: 1, 16: 2, 17: 3, 18: 4, 19: 2, 20: 3, 21: 1 } as Record<number, number>,
};
