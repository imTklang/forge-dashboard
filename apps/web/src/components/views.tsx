"use client";

import { motion } from "motion/react";
import { Activity, Moon, Zap, HeartPulse, GitCommit, CircleAlert, Plus } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "./GlassCard";
import { StatCard } from "./StatCard";
import { AgentBadge } from "./AgentBadge";
import { TaskList } from "./TaskList";
import { mock } from "@/features/mock";
import { cn } from "@/lib/cn";

const icons = { recovery: HeartPulse, hrv: Activity, sleep: Moon, strain: Zap } as const;

const stagger = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07 } });

function StatsRow() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {mock.stats.map((s, i) => (
        <motion.div key={s.key} {...stagger(i)}>
          <StatCard title={s.title} value={s.value} unit={s.unit} decimals={s.decimals} icon={icons[s.key as keyof typeof icons]} color={s.color} chart={s.chart} />
        </motion.div>
      ))}
    </div>
  );
}

export function TodayView() {
  return (
    <div className="flex flex-col gap-4">
      <StatsRow />
      <TaskList />
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard className="bg-forge/90 p-5" hover {...stagger(5)}>
          <div className="flex items-center justify-between"><p className="text-sm font-semibold">Mensagem do dia</p><AgentBadge at={mock.message.at} /></div>
          <p className="mt-3 text-base font-semibold leading-snug">{mock.message.text}</p>
        </GlassCard>
        <GlassCard className="p-5" {...stagger(6)}>
          <p className="mb-3 border-l-2 border-forge pl-2 text-sm font-semibold">Sugestões</p>
          <div className="flex flex-col gap-2">
            {mock.suggestions.map((s) => (
              <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{s.title}</p>
                  <AgentBadge at={s.at} />
                </div>
                <p className="mt-1 text-[11px] text-white/50">{s.project} · {s.estimate} min · energia {s.energy === "high" ? "alta" : "baixa"}</p>
                <p className="text-[11px] text-white/40">{s.reason}</p>
                <button className="mt-2 inline-flex items-center gap-1 rounded-full bg-forge px-3 py-1 text-[11px] font-semibold"><Plus size={12} />Adicionar ao checklist</button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export function HealthView() {
  const total = mock.sleepStages.reduce((a, s) => a + s.min, 0);
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60">
        WHOOP ainda não conectado — exibindo dados de exemplo. A integração será ativada depois.
      </div>
      <StatsRow />
      <GlassCard className="p-5" {...stagger(4)}>
        <p className="mb-3 border-l-2 border-forge pl-2 text-sm font-semibold">Recovery + HRV · 30 dias</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mock.trend30}>
              <defs>
                <linearGradient id="rec" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff6b1a" stopOpacity={0.5} /><stop offset="100%" stopColor="#ff6b1a" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="d" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1410", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="recovery" name="Recovery" stroke="#ff6b1a" strokeWidth={2} fill="url(#rec)" />
              <Area type="monotone" dataKey="hrv" name="HRV" stroke="#60a5fa" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
      <GlassCard className="p-5" {...stagger(5)}>
        <p className="mb-3 border-l-2 border-forge pl-2 text-sm font-semibold">Estágios do sono</p>
        <div className="flex h-4 overflow-hidden rounded-full">
          {mock.sleepStages.map((s) => <div key={s.name} style={{ width: `${(s.min / total) * 100}%`, background: s.color }} />)}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/60">
          {mock.sleepStages.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: s.color }} />{s.name} {Math.floor(s.min / 60)}h{String(s.min % 60).padStart(2, "0")}</span>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

export function ProjectsView() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {mock.projects.map((p, i) => (
        <GlassCard key={p.slug} className="p-5" hover {...stagger(i)}>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold"><i className="size-2.5 rounded-full" style={{ background: p.color }} />{p.name}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", p.idle >= 7 ? "bg-bad/20 text-bad" : "bg-ok/20 text-ok")}>{p.idle}d sem atividade</span>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-white/60"><GitCommit size={13} />{p.lastCommit}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40"><CircleAlert size={13} />{p.issues} issues · {p.week} commits na semana</p>
        </GlassCard>
      ))}
    </div>
  );
}
