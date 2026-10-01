import { describe, expect, it } from "vitest";
import { idleDays } from "./idle";

describe("idleDays", () => {
  it("null sem commit", () => expect(idleDays(null, "2026-10-01")).toBeNull());
  it("conta dias no fuso America/Fortaleza", () => {
    expect(idleDays(new Date("2026-09-24T15:00:00Z"), "2026-10-01")).toBe(7);
    expect(idleDays(new Date("2026-10-01T02:00:00Z"), "2026-10-01")).toBe(1); // 23h do dia 30 em Fortaleza
  });
  it("nunca negativo", () => expect(idleDays(new Date("2026-10-05T12:00:00Z"), "2026-10-01")).toBe(0));
});
