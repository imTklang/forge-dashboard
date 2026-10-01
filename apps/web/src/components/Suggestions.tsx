"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { AgentBadge } from "./AgentBadge";
import { api, TASKS_CHANGED } from "@/lib/client";

type Sug = { id: string; title: string; project: string | null; reason: string; estimateMin: number | null; energy: "high" | "medium" | "low"; accepted: boolean };
const energy = { high: "alta", medium: "média", low: "baixa" } as const;

export function Suggestions() {
  const [items, setItems] = useState<Sug[]>([]);
  const load = useCallback(async () => setItems(await api<Sug[]>("/suggestions").catch(() => [])), []);
  useEffect(() => { void load(); }, [load]);

  async function accept(id: string) {
    await api(`/suggestions/${id}/accept`, { method: "POST" });
    window.dispatchEvent(new Event(TASKS_CHANGED));
    await load();
  }

  return (
    <GlassCard className="p-5">
      <p className="mb-3 border-l-2 border-forge pl-2 text-sm font-semibold">Sugestões de hoje</p>
      <div className="flex flex-col gap-2">
        {items.map((s) => (
          <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{s.title}</p>
              <AgentBadge at="agente" />
            </div>
            <p className="mt-1 text-[11px] text-white/50">{s.project ?? "geral"}{s.estimateMin ? ` · ${s.estimateMin} min` : ""} · energia {energy[s.energy]}</p>
            <p className="text-[11px] text-white/40">{s.reason}</p>
            <button disabled={s.accepted} onClick={() => accept(s.id)} className="mt-2 inline-flex items-center gap-1 rounded-full bg-forge px-3 py-1 text-[11px] font-semibold disabled:opacity-40">
              <Plus size={12} />{s.accepted ? "Adicionada" : "Adicionar ao checklist"}
            </button>
          </div>
        ))}
        {!items.length && <p className="py-4 text-center text-xs text-white/40">Sem sugestões. Seu agente cria com <code>forge suggestions add</code>.</p>}
      </div>
    </GlassCard>
  );
}
