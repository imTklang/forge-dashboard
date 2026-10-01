import { describe, expect, it } from "vitest";
import { computeStreak } from "./streak";

describe("computeStreak", () => {
  it("conta dias consecutivos terminando hoje", () => {
    expect(computeStreak(["2026-09-28", "2026-09-29", "2026-09-30"], "2026-09-30")).toBe(3);
  });
  it("mantém o streak de ontem se hoje ainda não teve conclusão", () => {
    expect(computeStreak(["2026-09-28", "2026-09-29"], "2026-09-30")).toBe(2);
  });
  it("zera quando ontem e hoje não tiveram conclusão", () => {
    expect(computeStreak(["2026-09-27"], "2026-09-30")).toBe(0);
  });
  it("para no primeiro buraco", () => {
    expect(computeStreak(["2026-09-30", "2026-09-28"], "2026-09-30")).toBe(1);
  });
  it("atravessa virada de mês", () => {
    expect(computeStreak(["2026-09-30", "2026-10-01"], "2026-10-01")).toBe(2);
  });
});
