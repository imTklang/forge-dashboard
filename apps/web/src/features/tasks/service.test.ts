import { beforeEach, describe, expect, it, vi } from "vitest";

const updateMany = vi.fn();
const findUnique = vi.fn();
const update = vi.fn();
vi.mock("@/lib/db", () => ({ db: { task: { updateMany, findUnique, update }, project: { findUnique: vi.fn() } } }));

const { rollOverDeferred, deferTask, completeTask } = await import("./service");

const row = { id: "tsk_aaaa", title: "x", projectId: "p", project: { slug: "ideario" }, priority: "p2", estimateMin: null, status: "todo", date: "2026-09-30", source: "manual", subtasks: [] };

beforeEach(() => {
  vi.clearAllMocks();
  findUnique.mockResolvedValue(row);
  update.mockImplementation(async ({ data }) => ({ ...row, ...data }));
});

describe("tarefas adiadas", () => {
  it("rollOverDeferred move pendentes de dias anteriores para hoje como deferred", async () => {
    updateMany.mockResolvedValue({ count: 2 });
    expect(await rollOverDeferred("2026-10-01")).toBe(2);
    expect(updateMany).toHaveBeenCalledWith({
      where: { date: { lt: "2026-10-01" }, status: { in: ["todo", "doing", "deferred"] }, parentId: null },
      data: { status: "deferred", date: "2026-10-01" },
    });
  });

  it("deferTask marca deferred para o dia seguinte", async () => {
    vi.useFakeTimers().setSystemTime(new Date("2026-09-30T15:00:00Z"));
    const t = await deferTask("tsk_aaaa");
    expect(t.status).toBe("deferred");
    expect(t.date).toBe("2026-10-01");
    vi.useRealTimers();
  });

  it("completeTask registra completedDate", async () => {
    await completeTask("tsk_aaaa");
    expect(update.mock.calls[0]![0].data.completedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
