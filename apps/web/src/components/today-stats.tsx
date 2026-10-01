"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCheck, Clock, Flame, ListTodo } from "lucide-react";
import { StatCard } from "./stat-card";
import { api, TASKS_CHANGED } from "@/lib/client";

type Summary = { done: unknown[]; pending: unknown[]; streak: number };
type TaskLite = { estimateMin: number | null; status: string };

export function TodayStats() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [remainingMin, setRemainingMin] = useState(0);

  const load = useCallback(async () => {
    try {
      const [s, tasks] = await Promise.all([api<Summary>("/summary"), api<TaskLite[]>("/tasks?date=today")]);
      setSummary(s);
      setRemainingMin(tasks.filter((t) => t.status !== "done").reduce((sum, t) => sum + (t.estimateMin ?? 0), 0));
    } catch {
      /* cartões ficam zerados até a API responder */
    }
  }, []);

  useEffect(() => {
    void load();
    window.addEventListener(TASKS_CHANGED, load);
    return () => window.removeEventListener(TASKS_CHANGED, load);
  }, [load]);

  return (
    <section aria-label="Resumo do dia" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard title="Streak" value={summary?.streak ?? 0} unit="dias" icon={Flame} />
      <StatCard title="Concluídas hoje" value={summary?.done.length ?? 0} icon={CheckCheck} />
      <StatCard title="Pendentes" value={summary?.pending.length ?? 0} icon={ListTodo} />
      <StatCard title="Tempo estimado" value={Math.round((remainingMin / 60) * 10) / 10} unit="h" decimals={1} icon={Clock} />
    </section>
  );
}
