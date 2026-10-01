"use client";

import { useCallback, useEffect, useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Plus, SkipForward } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { AgentBadge } from "./AgentBadge";
import { cn } from "@/lib/cn";

type TaskDto = { id: string; title: string; project: string; priority: "p1" | "p2" | "p3"; estimateMin: number | null; status: string; source: string };

const prio = { p1: "bg-bad/20 text-bad", p2: "bg-warn/20 text-warn", p3: "bg-info/20 text-info" } as const;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, { ...init, headers: { "content-type": "application/json" } });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message ?? "erro");
  return body.data as T;
}

function Row({ t, onDone, onDefer }: { t: TaskDto; onDone: () => void; onDefer: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: t.id });
  const done = t.status === "done";
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <button {...attributes} {...listeners} aria-label="Reordenar" className="cursor-grab text-white/30 touch-none"><GripVertical size={14} /></button>
      <button onClick={onDone} aria-label="Concluir" className={cn("grid size-5 shrink-0 place-items-center rounded-full border border-white/30", done && "border-ok bg-ok text-black")}>
        {done && <Check size={12} />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", done && "text-white/40 line-through")}>{t.title}</p>
        <p className="text-[11px] text-white/40">{t.project}{t.estimateMin ? ` · ${t.estimateMin} min` : ""} · {t.id}{t.status === "deferred" ? " · adiada" : ""}</p>
      </div>
      {t.source === "agent" && <AgentBadge at="agente" />}
      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", prio[t.priority])}>{t.priority}</span>
      {!done && <button onClick={onDefer} aria-label="Adiar para amanhã" title="Adiar para amanhã" className="text-white/30 hover:text-white"><SkipForward size={14} /></button>}
    </div>
  );
}

export function TaskList() {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("ideario");
  const [projects, setProjects] = useState<{ slug: string; name: string }[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setTasks(await api<TaskDto[]>("/tasks?date=today"));
      setProjects(await api("/projects"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api("/tasks", { method: "POST", body: JSON.stringify({ title, project }) });
    setTitle("");
    await load();
  }
  const act = (id: string, action: "done" | "defer") => async () => { await api(`/tasks/${id}/${action}`, { method: "POST" }); await load(); };

  async function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const next = arrayMove(tasks, tasks.findIndex((t) => t.id === active.id), tasks.findIndex((t) => t.id === over.id));
    setTasks(next);
    await api("/tasks/reorder", { method: "POST", body: JSON.stringify({ ids: next.map((t) => t.id) }) });
  }

  return (
    <GlassCard className="p-5">
      <p className="mb-3 border-l-2 border-forge pl-2 text-sm font-semibold">Checklist de hoje</p>
      <form onSubmit={add} className="mb-3 flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nova tarefa…" className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs outline-none" />
        <select value={project} onChange={(e) => setProject(e.target.value)} className="rounded-full border border-white/10 bg-black/20 px-3 text-xs outline-none">
          {projects.map((p) => <option key={p.slug} value={p.slug} className="text-black">{p.name}</option>)}
        </select>
        <button aria-label="Adicionar" className="grid size-8 place-items-center rounded-full bg-forge"><Plus size={14} /></button>
      </form>
      {error && <p className="text-xs text-bad">{error}</p>}
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {tasks.map((t) => <Row key={t.id} t={t} onDone={act(t.id, "done")} onDefer={act(t.id, "defer")} />)}
            {!tasks.length && !error && <p className="py-4 text-center text-xs text-white/40">Nada por aqui. Adicione uma tarefa ou peça sugestões ao seu agente.</p>}
          </div>
        </SortableContext>
      </DndContext>
    </GlassCard>
  );
}
