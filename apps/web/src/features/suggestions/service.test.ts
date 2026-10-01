import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const update = vi.fn();
const createTask = vi.fn();
vi.mock("@/lib/db", () => ({ db: { suggestion: { findUnique, update }, project: { findFirst: vi.fn() } } }));
vi.mock("@/features/tasks/service", () => ({ createTask }));

const { acceptSuggestion } = await import("./service");

beforeEach(() => vi.clearAllMocks());

describe("acceptSuggestion", () => {
  it("cria tarefa de origem agente e marca a sugestão como aceita", async () => {
    findUnique.mockResolvedValue({ id: "sug_1", title: "Landing", estimateMin: 90, acceptedTaskId: null, project: { slug: "portfolio" } });
    createTask.mockResolvedValue({ id: "tsk_9" });
    await acceptSuggestion("sug_1");
    expect(createTask).toHaveBeenCalledWith(expect.objectContaining({ title: "Landing", project: "portfolio", estimateMin: 90, source: "agent" }));
    expect(update).toHaveBeenCalledWith({ where: { id: "sug_1" }, data: { acceptedTaskId: "tsk_9" } });
  });
  it("não aceita duas vezes", async () => {
    findUnique.mockResolvedValue({ id: "sug_1", acceptedTaskId: "tsk_9", project: null });
    await expect(acceptSuggestion("sug_1")).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(createTask).not.toHaveBeenCalled();
  });
  it("sugestão inexistente → NOT_FOUND", async () => {
    findUnique.mockResolvedValue(null);
    await expect(acceptSuggestion("sug_x")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
