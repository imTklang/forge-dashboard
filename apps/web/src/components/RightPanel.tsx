"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Flame, MoreHorizontal } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { mock } from "@/features/mock";
import { cn } from "@/lib/cn";
import { api } from "@/lib/client";

const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];

function heatClass(n: number | undefined) {
  if (!n) return "text-white/50";
  if (n >= 4) return "bg-forge text-white";
  if (n >= 2) return "bg-forge/60 text-white";
  return "bg-forge/30 text-white";
}

export function RightPanel() {
  const { user, scheduled } = mock;
  const [summary, setSummary] = useState<{ streak: number; heat: Record<string, number> }>({ streak: 0, heat: {} });
  useEffect(() => { api<typeof summary>("/summary").then(setSummary).catch(() => {}); }, []);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
  const label = today.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
      <GlassCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-forge font-bold">E</div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-white/50">{user.handle}</p>
          </div>
          <MoreHorizontal size={16} className="text-white/40" />
        </div>
        <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 py-2 text-center">
          <div><p className="text-sm font-bold">{user.weightKg} kg</p><p className="text-[10px] text-white/50">Peso</p></div>
          <div><p className="text-sm font-bold">{user.heightCm} cm</p><p className="text-[10px] text-white/50">Altura</p></div>
          <div><p className="flex items-center justify-center gap-1 text-sm font-bold"><Flame size={13} className="text-forge" />{summary.streak}</p><p className="text-[10px] text-white/50">Streak</p></div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <p className="mb-3 text-sm font-semibold capitalize">{label}</p>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
          {weekdays.map((d, i) => <span key={i} className="text-white/30">{d}</span>)}
          {Array.from({ length: first }, (_, i) => <span key={`b${i}`} />)}
          {Array.from({ length: days }, (_, i) => {
            const d = i + 1;
            return (
              <span
                key={d}
                className={cn("grid aspect-square place-items-center rounded-full", heatClass(summary.heat[`${prefix}${String(d).padStart(2, "0")}`]), d === today.getDate() && "ring-2 ring-white")}
              >
                {d}
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-[10px] text-white/40">Intensidade = tarefas concluídas no dia</p>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="border-l-2 border-forge pl-2 text-sm font-semibold">Agendados</p>
          <span className="text-[11px] text-white/40">ver todos</span>
        </div>
        <div className="flex flex-col gap-2">
          {scheduled.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ y: -2 }}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <div>
                <p className="text-xs font-semibold">{r.text}</p>
                <p className="text-[10px] text-white/40">{r.repeat}</p>
              </div>
              <span className="text-xs font-bold text-forge">{r.time}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </aside>
  );
}
