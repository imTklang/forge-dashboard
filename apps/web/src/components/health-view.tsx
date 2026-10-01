"use client";

import { Activity, HeartPulse, Moon, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { recoveryZone } from "@forge/core";
import { StatCard, type Tone } from "./stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { sampleHealth as h } from "@/features/mock";

const zoneTone: Record<ReturnType<typeof recoveryZone>, Tone> = { green: "success", yellow: "warning", red: "destructive" };
const total = h.sleepStages.reduce((sum, s) => sum + s.min, 0);
const hm = (min: number) => `${Math.floor(min / 60)}h${String(min % 60).padStart(2, "0")}`;

export function HealthView() {
  return (
    <>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">Dados de exemplo</Badge>
        Conecte o WHOOP para ver seus números reais.
      </p>

      <section aria-label="Métricas de hoje" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard title="Recovery" value={h.recovery.value} unit="%" icon={HeartPulse} tone={zoneTone[recoveryZone(h.recovery.value)]} chart={h.recovery.chart} />
        <StatCard title="HRV" value={h.hrv.value} unit="ms" icon={Activity} chart={h.hrv.chart} />
        <StatCard title="Sono" value={h.sleep.value} unit="h" decimals={1} icon={Moon} chart={h.sleep.chart} />
        <StatCard title="Strain" value={h.strain.value} decimals={1} icon={Zap} chart={h.strain.chart} />
      </section>

      <Card>
        <CardContent>
          <h2>Recovery e HRV · 30 dias</h2>
          <div className="h-56" role="img" aria-label="Gráfico de recovery e HRV dos últimos 30 dias">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={h.trend30}>
                <defs>
                  <linearGradient id="recovery-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }} />
                <Area type="monotone" dataKey="recovery" name="Recovery" stroke="var(--chart-1)" strokeWidth={2} fill="url(#recovery-fill)" />
                <Area type="monotone" dataKey="hrv" name="HRV" stroke="var(--chart-2)" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex gap-4 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5"><i aria-hidden="true" className="size-2 rounded-full bg-chart-1" />Recovery</li>
            <li className="flex items-center gap-1.5"><i aria-hidden="true" className="size-2 rounded-full bg-chart-2" />HRV</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2>Estágios do sono</h2>
          <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label={`Estágios do sono: ${h.sleepStages.map((s) => `${s.name} ${hm(s.min)}`).join(", ")}`}>
            {h.sleepStages.map((s) => (
              <div key={s.name} className="w-(--w) bg-(--c)" style={{ "--w": `${(s.min / total) * 100}%`, "--c": s.color } as React.CSSProperties} />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {h.sleepStages.map((s) => (
              <li key={s.name} className="flex items-center gap-1.5">
                <i aria-hidden="true" className="size-2 rounded-full bg-(--c)" style={{ "--c": s.color } as React.CSSProperties} />
                {s.name} <span className="tabular-nums">{hm(s.min)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
