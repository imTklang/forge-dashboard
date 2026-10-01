// Dados de exemplo da tela Saúde. Substituídos pela integração WHOOP quando ela for ativada.
export const sampleHealth = {
  recovery: { value: 72, chart: [55, 62, 48, 70, 66, 74, 72] },
  hrv: { value: 68, chart: [60, 64, 58, 66, 71, 65, 68] },
  sleep: { value: 7.4, chart: [6.5, 7, 6.8, 7.9, 7.2, 7.1, 7.4] },
  strain: { value: 11.8, chart: [9, 12, 14, 8, 13, 10, 11.8] },
  trend30: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    recovery: Math.round(60 + 15 * Math.sin(i / 3) + (i % 5)),
    hrv: Math.round(62 + 8 * Math.cos(i / 4)),
  })),
  sleepStages: [
    { name: "Leve", min: 220, color: "var(--chart-3)" },
    { name: "Profundo", min: 95, color: "var(--chart-1)" },
    { name: "REM", min: 110, color: "var(--chart-2)" },
    { name: "Acordado", min: 19, color: "var(--chart-4)" },
  ],
};
