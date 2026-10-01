"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmButton } from "./confirm-button";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";

type Reminder = { id: string; text: string; at: string; repeat: "none" | "daily" | "weekdays"; active: boolean };
type Summary = { date: string; heat: Record<string, number> };

const repeatLabel = { none: "Uma vez", daily: "Todo dia", weekdays: "Dias úteis" } as const;
const weekdayNarrow = (i: number) => new Intl.DateTimeFormat("pt-BR", { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2023, 0, 1 + i)));
const weekdayLong = (i: number) => new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2023, 0, 1 + i)));

function level(n: number) {
  if (n >= 4) return "bg-primary text-primary-foreground";
  if (n >= 2) return "bg-primary/55 text-foreground";
  if (n >= 1) return "bg-primary/25 text-foreground";
  return "text-muted-foreground";
}

function Calendar({ summary }: { summary: Summary | null }) {
  if (!summary) return <div className="h-56" aria-hidden="true" />;
  const [y, m, today] = summary.date.split("-").map(Number) as [number, number, number];
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
  const iso = (d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <>
      <h2 className="first-letter:uppercase">{label}</h2>
      <div className="grid grid-cols-7 gap-x-1 gap-y-2.5 text-center text-xs">
        {Array.from({ length: 7 }, (_, i) => (
          <abbr key={i} title={weekdayLong(i)} className="py-1 text-muted-foreground no-underline">{weekdayNarrow(i)}</abbr>
        ))}
        {Array.from({ length: first }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1;
          const n = summary.heat[iso(d)] ?? 0;
          return (
            <span key={d} title={`Dia ${d}: ${n} ${n === 1 ? "tarefa concluída" : "tarefas concluídas"}`} className={cn("mx-auto grid size-8 place-items-center rounded-full tabular-nums", level(n), d === today && "ring-2 ring-foreground")}>
              {d}
            </span>
          );
        })}
      </div>
    </>
  );
}

export function RightPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [text, setText] = useState("");
  const [time, setTime] = useState("09:00");
  const [repeat, setRepeat] = useState("none");
  const [error, setError] = useState("");

  const loadReminders = useCallback(() => api<Reminder[]>("/reminders").then(setReminders).catch(() => {}), []);
  useEffect(() => {
    api<Summary>("/summary").then(setSummary).catch(() => {});
    void loadReminders();
  }, [loadReminders]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api("/reminders", { method: "POST", body: JSON.stringify({ text: text.trim(), at: time, repeat }) });
      setText("");
      setError("");
      await loadReminders();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <aside aria-label="Calendário e lembretes" className="flex w-full flex-col gap-4 xl:w-80 xl:shrink-0">
      <Card>
        <CardContent>
          <Calendar summary={summary} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2>Agendados</h2>
          {reminders.length === 0 && <p className="text-sm text-muted-foreground">Nenhum lembrete.</p>}
          <ul className="flex flex-col gap-2">
            {reminders.map((r) => (
              <li key={r.id} className={cn("flex items-center gap-3 rounded-2xl border bg-secondary/40 py-2 pr-1.5 pl-3", !r.active && "opacity-50")}>
                <span className="text-sm font-semibold text-primary tabular-nums">{r.at}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.text}</p>
                  <p className="text-xs text-muted-foreground">{r.active ? repeatLabel[r.repeat] : "Concluído"}</p>
                </div>
                <ConfirmButton icon={X} label={`Remover lembrete ${r.text}`} title="Remover lembrete?" description={`“${r.text}” será removido.`} confirmLabel="Remover" onConfirm={async () => { await api(`/reminders/${r.id}`, { method: "DELETE" }); await loadReminders(); }} />
              </li>
            ))}
          </ul>
          <form onSubmit={add} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Label htmlFor="reminder-text" className="sr-only">Texto do lembrete</Label>
              <Input id="reminder-text" name="text" autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} placeholder="Novo lembrete…" required />
              <Button type="submit" size="icon" aria-label="Adicionar lembrete" className="shrink-0">
                <Plus aria-hidden="true" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Label htmlFor="reminder-time" className="sr-only">Horário</Label>
              <Input id="reminder-time" name="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="min-w-0 flex-1" />
              <Label htmlFor="reminder-repeat" className="sr-only">Repetição</Label>
              <select id="reminder-repeat" name="repeat" value={repeat} onChange={(e) => setRepeat(e.target.value)} className="h-9 min-w-0 flex-1 rounded-xl border border-input px-3 text-sm">
                <option value="none">Uma vez</option>
                <option value="daily">Todo dia</option>
                <option value="weekdays">Dias úteis</option>
              </select>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </aside>
  );
}
