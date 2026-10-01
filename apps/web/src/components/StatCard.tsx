"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { CountUp } from "./CountUp";

type Props = {
  title: string;
  value: number;
  unit?: string;
  decimals?: number;
  icon: LucideIcon;
  /** hex color used for icon + sparkline */
  color: string;
  chart: number[];
};

export function StatCard({ title, value, unit, decimals = 0, icon: Icon, color, chart }: Props) {
  const data = chart.map((v, i) => ({ i, v }));
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl bg-white p-4 text-neutral-900 shadow-lg shadow-black/20"
    >
      <div className="flex items-center justify-between text-sm font-medium text-neutral-600">
        {title}
        <span className="grid size-6 place-items-center rounded-full" style={{ background: `${color}22`, color }}>
          <Icon size={14} />
        </span>
      </div>
      <div className="mt-2 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 text-2xl font-bold">
        <CountUp value={value} decimals={decimals} />
        {unit && <span className="ml-1 text-xs font-medium text-neutral-500">{unit}</span>}
      </div>
    </motion.div>
  );
}
