"use client";

import { motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { CountUp } from "./count-up";

export type Tone = "primary" | "success" | "warning" | "destructive";
const toneColor: Record<Tone, string> = { primary: "var(--primary)", success: "var(--success)", warning: "var(--warning)", destructive: "var(--destructive)" };

type Props = {
  title: string;
  value: number;
  unit?: string;
  decimals?: number;
  icon: LucideIcon;
  /** Cor do gráfico. Cores de status só quando o valor representa um estado (ex.: recovery). */
  tone?: Tone;
  chart?: number[];
};

/** Cartão de métrica: título, valor grande, unidade e mini-gráfico opcional. Mesmo formato em todas as telas. */
export function StatCard({ title, value, unit, decimals = 0, icon: Icon, tone = "primary", chart }: Props) {
  const reduced = useReducedMotion();
  return (
    <motion.div whileHover={{ y: -2 }} className="h-full">
      <Card className="h-full">
        <CardContent>
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="text-sm font-medium">{title}</p>
            <Icon aria-hidden="true" className="size-4" />
          </div>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            <CountUp value={value} decimals={decimals} />
            {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
          </p>
        </CardContent>
        {chart && (
          <CardContent aria-hidden="true" className="h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart.map((v, i) => ({ i, v }))}>
                <YAxis hide domain={["auto", "auto"]} />
                <Line type="monotone" dataKey="v" stroke={toneColor[tone]} strokeWidth={2} dot={false} isAnimationActive={!reduced} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
