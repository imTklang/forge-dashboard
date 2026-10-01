import { describe, expect, it } from "vitest";
import { dueReminders } from "./due";

const r = (o: Partial<{ id: string; timeOfDay: string; repeat: string; active: boolean; lastFiredDate: string | null }> = {}) => ({ id: "rem_1", timeOfDay: "09:00", repeat: "daily", active: true, lastFiredDate: null, ...o });
const wed = { date: "2026-10-01", time: "09:30", weekday: 4 };

describe("dueReminders", () => {
  it("dispara quando o horário foi alcançado e ainda não disparou hoje", () => expect(dueReminders([r()], wed)).toHaveLength(1));
  it("não dispara antes do horário", () => expect(dueReminders([r({ timeOfDay: "10:00" })], wed)).toHaveLength(0));
  it("não dispara duas vezes no mesmo dia", () => expect(dueReminders([r({ lastFiredDate: "2026-10-01" })], wed)).toHaveLength(0));
  it("dispara de novo no dia seguinte", () => expect(dueReminders([r({ lastFiredDate: "2026-09-30" })], wed)).toHaveLength(1));
  it("ignora inativos", () => expect(dueReminders([r({ active: false })], wed)).toHaveLength(0));
  it("weekdays não dispara no fim de semana", () => {
    expect(dueReminders([r({ repeat: "weekdays" })], { ...wed, weekday: 6 })).toHaveLength(0);
    expect(dueReminders([r({ repeat: "weekdays" })], { ...wed, weekday: 0 })).toHaveLength(0);
    expect(dueReminders([r({ repeat: "weekdays" })], wed)).toHaveLength(1);
  });
});
