"use client";

import { useCallback, useEffect, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Plus, SkipForward } from "lucide-react";
import { AgentBadge } from "./agent-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, TASKS_CHANGED } from "@/lib/client";
import { cn } from "@/lib/utils";

type TaskDto = { id: string; title: string; project: string; priority: "p1" | "p2" | "p3"; estimateMin: number | null; status: string; source: string; createdAt: string };
type ProjectLite = { slug: string; name: string };

const priorityVariant = { p1: "destructive", p2: "warning", p3: "secondary" } as const;

function Row({ task, onDone, onDefer }: { task: TaskDto; onDone: () => void; onDefer: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const done = task.status === "done";
  return (
    <li
      ref={setNodeRef}
      style={{ "--drag-transform": CSS.Transform.toString(transform), "--drag-transition": transition } as React.CSSProperties}
      className={cn("sortable-item flex items-center gap-3 rounded-2xl border bg-secondary/40 px-3 py-2.5", isDragging && "relative z-10 select-none ring-2 ring-ring")}
    >
      <button type="button" aria-label={`Reordenar ${task.title}`} className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground" {...attributes} {...listeners}>
        <GripVertical aria-hidden="true" className="size-4" />
      </button>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`Concluir ${task.title}`}
        disabled={done}
        onClick={onDone}
        className={cn("grid size-6 shrink-0 place-items-center rounded-full border border-muted-foreground/60 transition-colors hover:border-primary", done && "border-success bg-success text-background")}
      >
        {done && <Check aria-hidden="true" className="size-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", done && "text-muted-foreground line-through")}>{task.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {task.project}
          {task.estimateMin ? ` · ${task.estimateMin} min` : ""}
          {task.status === "deferred" ? " · adiada" : ""}
        </p>
      </div>
      {task.source === "agent" && <AgentBadge at={task.createdAt} />}
      <Badge variant={priorityVariant[task.priority]}>{task.priority.toUpperCase()}</Badge>
      {!done && (
        <Button variant="quiet" size="icon-sm" aria-label={`Adiar ${task.title} para amanhã`} onClick={onDefer}>
          <SkipForward aria-hidden="true" />
        </Button>
      )}
    </li>
  );
}

export function TaskList() {
  const [tasks, setTasks] = useState<TaskDto[] | null>(null);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const load = useCallback(async () => {
    try {
      setTasks(await api<TaskDto[]>("/tasks?date=today"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    void load();
    api<ProjectLite[]>("/projects").then((p) => {
      setProjects(p);
      setProject((cur) => cur || p[0]?.slug || "");
    }).catch(() => {});
    window.addEventListener(TASKS_CHANGED, load);
    return () => window.removeEventListener(TASKS_CHANGED, load);
  }, [load]);

  async function change() {
    await load();
    window.dispatchEvent(new Event(TASKS_CHANGED));
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || sending) return;
    setSending(true);
    try {
      await api("/tasks", { method: "POST", body: JSON.stringify({ title: title.trim(), project }) });
      setTitle("");
      await change();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  const act = (id: string, action: "done" | "defer") => async () => {
    await api(`/tasks/${id}/${action}`, { method: "POST" });
    await change();
  };

  async function onDragEnd({ active, over }: DragEndEvent) {
    if (!tasks || !over || active.id === over.id) return;
    const next = arrayMove(tasks, tasks.findIndex((t) => t.id === active.id), tasks.findIndex((t) => t.id === over.id));
    setTasks(next);
    await api("/tasks/reorder", { method: "POST", body: JSON.stringify({ ids: next.map((t) => t.id) }) });
  }

  return (
    <Card>
      <CardContent>
        <h2>Checklist de hoje</h2>
        <form onSubmit={add} className="flex flex-wrap gap-2">
          <Label htmlFor="new-task" className="sr-only">Nova tarefa</Label>
          <Input id="new-task" name="title" autoComplete="off" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Descreva a tarefa…" required className="min-w-0 flex-1 basis-48" />
          <Label htmlFor="new-task-project" className="sr-only">Projeto</Label>
          <select id="new-task-project" name="project" value={project} onChange={(e) => setProject(e.target.value)} className="h-9 rounded-xl border border-input px-3 text-sm">
            {projects.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>
          <Button type="submit" disabled={sending}>
            <Plus aria-hidden="true" data-icon="inline-start" />
            Adicionar tarefa
          </Button>
        </form>
        {error && <p role="alert" className="text-sm text-destructive">Não foi possível concluir a ação: {error}. Recarregue a página e tente de novo.</p>}
        {tasks === null ? (
          <div className="flex flex-col gap-2" aria-busy="true">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <ul className="flex flex-col gap-2">
                {tasks.map((t) => (
                  <Row key={t.id} task={t} onDone={act(t.id, "done")} onDefer={act(t.id, "defer")} />
                ))}
              </ul>
            </SortableContext>
            {!tasks.length && !error && <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma tarefa para hoje. Adicione uma acima ou aceite uma sugestão.</p>}
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
