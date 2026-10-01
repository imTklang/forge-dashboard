import { describe, expect, it } from "vitest";
import { fallbackMessage } from "./rules";

describe("fallbackMessage", () => {
  it("usa streak, tarefas de ontem e projeto parado", () => {
    const m = fallbackMessage({ streak: 4, doneYesterday: 1, openToday: 3, idleProject: { name: "Portfólio", days: 9 } });
    expect(m).toBe("4 dias seguidos produtivos. Ontem você concluiu 1 tarefa. Portfólio está há 9 dias sem commit. Hoje: 3 tarefas abertas.");
  });
  it("omite o que não se aplica", () => {
    expect(fallbackMessage({ streak: 1, doneYesterday: 0, openToday: 1, idleProject: { name: "X", days: 2 } })).toBe("Hoje: 1 tarefa aberta.");
  });
  it("sem dados, dá um passo concreto (não cita frase genérica)", () => {
    expect(fallbackMessage({ streak: 0, doneYesterday: 0, openToday: 0 })).toBe("Nenhuma tarefa ainda hoje. Comece com uma pequena.");
  });
});
