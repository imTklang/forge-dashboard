import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const update = vi.fn();
const create = vi.fn();
const sendPush = vi.fn();
vi.mock("@/lib/db", () => ({ db: { reminder: { findMany, update, create } } }));
vi.mock("./push", () => ({ sendPush }));

const { fireDueReminders, createReminder } = await import("./service");

const now = { date: "2026-10-01", time: "09:30", weekday: 4 };
const row = (o: object) => ({ id: "rem_1", text: "Beber água", timeOfDay: "09:00", repeat: "daily", active: true, lastFiredDate: null, ...o });

beforeEach(() => {
  vi.clearAllMocks();
  create.mockImplementation(async ({ data }) => ({ ...data, active: true }));
});

describe("fireDueReminders", () => {
  it("envia push e marca lastFiredDate; lembrete diário continua ativo", async () => {
    findMany.mockResolvedValue([row({})]);
    expect(await fireDueReminders(now)).toBe(1);
    expect(sendPush).toHaveBeenCalledWith("Forge", "Beber água");
    expect(update).toHaveBeenCalledWith({ where: { id: "rem_1" }, data: { lastFiredDate: "2026-10-01" } });
  });
  it("lembrete único é desativado após disparar", async () => {
    findMany.mockResolvedValue([row({ repeat: "none" })]);
    await fireDueReminders(now);
    expect(update.mock.calls[0]![0].data).toEqual({ lastFiredDate: "2026-10-01", active: false });
  });
  it("não envia nada se já disparou hoje", async () => {
    findMany.mockResolvedValue([row({ lastFiredDate: "2026-10-01" })]);
    expect(await fireDueReminders(now)).toBe(0);
    expect(sendPush).not.toHaveBeenCalled();
  });
});

describe("createReminder", () => {
  it("horário futuro de hoje fica pendente (lastFiredDate nulo)", async () => {
    vi.useFakeTimers().setSystemTime(new Date("2026-10-01T10:00:00Z")); // 07:00 em Fortaleza
    await createReminder({ text: "x", at: "09:00", repeat: "daily" });
    expect(create.mock.calls[0]![0].data.lastFiredDate).toBeNull();
    vi.useRealTimers();
  });
  it("horário que já passou hoje não dispara imediatamente", async () => {
    vi.useFakeTimers().setSystemTime(new Date("2026-10-01T15:00:00Z")); // 12:00 em Fortaleza
    await createReminder({ text: "x", at: "09:00", repeat: "daily" });
    expect(create.mock.calls[0]![0].data.lastFiredDate).toBe("2026-10-01");
    vi.useRealTimers();
  });
});
