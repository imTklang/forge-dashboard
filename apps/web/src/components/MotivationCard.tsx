"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "./GlassCard";
import { AgentBadge } from "./AgentBadge";
import { api } from "@/lib/client";

type Msg = { text: string; source: "agent" | "rule" };
type Summary = { done: { id: string; title: string }[]; pending: { id: string; title: string }[] };

export function MotivationCard() {
  const [msg, setMsg] = useState<Msg | null>(null);
  const [sum, setSum] = useState<Summary | null>(null);
  useEffect(() => {
    api<Msg>("/motivation").then(setMsg).catch(() => {});
    api<Summary>("/summary").then(setSum).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <GlassCard className="bg-forge/90 p-5" hover>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Mensagem do dia</p>
          {msg?.source === "agent" && <AgentBadge at="agente" />}
        </div>
        <p className="mt-3 text-base font-semibold leading-snug">{msg?.text ?? "…"}</p>
      </GlassCard>
      <GlassCard className="p-5">
        <p className="mb-2 border-l-2 border-forge pl-2 text-sm font-semibold">Resumo do dia</p>
        <p className="text-xs text-white/70"><span className="font-bold text-ok">{sum?.done.length ?? 0}</span> feitas · <span className="font-bold text-warn">{sum?.pending.length ?? 0}</span> pendentes (serão adiadas)</p>
        {!!sum?.pending.length && <ul className="mt-2 list-disc pl-4 text-[11px] text-white/50">{sum.pending.slice(0, 4).map((t) => <li key={t.id}>{t.title}</li>)}</ul>}
      </GlassCard>
    </div>
  );
}
