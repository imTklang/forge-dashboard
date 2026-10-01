// Mock só do que depende do WHOOP (saúde) e de lembretes (Fase 6).
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
  scheduled: [
    { id: "rem_1", text: "Beber água e alongar", time: "10:00", repeat: "Diário" },
    { id: "rem_2", text: "Revisar PRs abertos", time: "14:30", repeat: "Dias úteis" },
    { id: "rem_3", text: "Resumo do dia", time: "21:00", repeat: "Diário" },
  ],
};
