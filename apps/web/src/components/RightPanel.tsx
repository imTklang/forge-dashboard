"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Flame, MoreHorizontal, Plus, X } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { mock } from "@/features/mock";
import { cn } from "@/lib/cn";
import { api } from "@/lib/client";

type Reminder = { id: string; text: string; at: string; repeat: string; active: boolean };
const repeatLabel: Record<string, string> = { none: "Uma vez", daily: "Diário", weekdays: "Dias úteis" };
const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];

function heatClass(n: number | undefined) {
  if (!n) return "text-white/50";
  if (n >= 4) return "bg-forge text-white";
  if (n >= 2) return "bg-forge/60 text-white";
  return "bg-forge/30 text-white";
}

export function RightPanel() {
  const { user } = mock;
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [text, setText] = useState("");
  const [time, setTime] = useState("09:00");
  const [repeat, setRepeat] = useState("none");
  const loadReminders = () => api<Reminder[]>("/reminders").then(setReminders).catch(() => {});
  useEffect(() => { void loadReminders(); }, []);
  async function addReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await api("/reminders", { method: "POST", body: JSON.stringify({ text, at: time, repeat }) });
    setText("");
    await loadReminders();
  }
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
                  </div>
        <div className="flex flex-col gap-2">
          {reminders.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              whileHover={{ y: -2 }}
              className={cn("flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2", !r.active && "opacity-40")}
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{r.text}</p>
                <p className="text-[10px] text-white/40">{repeatLabel[r.repeat]}{!r.active && " · concluído"}</p>
              </div>
              <span className="text-xs font-bold text-forge">{r.at}</span>
              <button aria-label="Remover" onClick={async () => { await api(`/reminders/${r.id}`, { method: "DELETE" }); await loadReminders(); }} className="text-white/30 hover:text-bad"><X size={13} /></button>
            </motion.div>
          ))}
          {!reminders.length && <p className="py-2 text-center text-[11px] text-white/40">Nenhum lembrete.</p>}
          <form onSubmit={addReminder} className="mt-1 flex flex-wrap gap-1.5">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Novo lembrete…" className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] outline-none" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-full border border-white/10 bg-black/20 px-2 text-[11px] outline-none" />
            <select value={repeat} onChange={(e) => setRepeat(e.target.value)} className="rounded-full border border-white/10 bg-black/20 px-2 text-[11px] outline-none">
              <option value="none" className="text-black">Uma vez</option><option value="daily" className="text-black">Diário</option><option value="weekdays" className="text-black">Dias úteis</option>
            </select>
            <button aria-label="Adicionar lembrete" className="grid size-7 place-items-center rounded-full bg-forge"><Plus size={13} /></button>
          </form>
        </div>
      </GlassCard>
    </aside>
  );
}
