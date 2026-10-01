"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AgentBadge } from "./agent-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, TASKS_CHANGED } from "@/lib/client";

type Sug = { id: string; title: string; project: string | null; reason: string; estimateMin: number | null; energy: "high" | "medium" | "low"; accepted: boolean; createdAt: string };
const energy = { high: "alta", medium: "média", low: "baixa" } as const;

export function Suggestions() {
  const [items, setItems] = useState<Sug[]>([]);
  const load = useCallback(async () => setItems(await api<Sug[]>("/suggestions").catch(() => [])), []);
  useEffect(() => {
    void load();
  }, [load]);

  async function accept(id: string) {
    await api(`/suggestions/${id}/accept`, { method: "POST" });
    window.dispatchEvent(new Event(TASKS_CHANGED));
    await load();
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <h2>Sugestões de hoje</h2>
        {items.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Sem sugestões por enquanto. Seu agente cria com <code translate="no">forge suggestions add</code>.</p>}
        <ul className="flex flex-col gap-2">
          {items.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 rounded-2xl border bg-secondary/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 text-sm font-medium text-pretty">{s.title}</p>
                <AgentBadge at={s.createdAt} />
              </div>
              <p className="text-xs text-muted-foreground">
                {s.project ?? "geral"}
                {s.estimateMin ? ` · ${s.estimateMin} min` : ""} · energia {energy[s.energy]}
              </p>
              <p className="text-xs text-muted-foreground">{s.reason}</p>
              <Button size="sm" variant="secondary" disabled={s.accepted} onClick={() => accept(s.id)} className="self-start">
                {!s.accepted && <Plus aria-hidden="true" data-icon="inline-start" />}
                {s.accepted ? "Adicionada" : "Adicionar ao checklist"}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
