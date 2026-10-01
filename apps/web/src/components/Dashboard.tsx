"use client";

import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { HealthView, ProjectsView, TodayView } from "./views";
import { mock } from "@/features/mock";
import { cn } from "@/lib/cn";

const tabs = ["Hoje", "Saúde", "Projetos"] as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export function Dashboard() {
  const [tab, setTab] = useState(0);
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-4 p-3 pb-28 lg:flex-row lg:p-5 lg:pb-5">
      <Sidebar active={tab} onChange={setTab} />
      <main className="flex min-w-0 flex-1 flex-col rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:p-6">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{greeting()}, {mock.user.name} 👋</h1>
            <p className="text-xs capitalize text-white/50">{today} · vamos codar</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex w-52 items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-white/50">
              <Search size={14} />
              <input placeholder="Buscar tarefa ou projeto…" className="w-full bg-transparent outline-none placeholder:text-white/40" />
            </label>
            <button aria-label="Notificações" className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/5"><Bell size={16} /></button>
          </div>
        </header>
        <div className="flex-1">
          {tab === 0 && <TodayView />}
          {tab === 1 && <HealthView />}
          {tab === 2 && <ProjectsView />}
        </div>
        <div className="mt-6 flex justify-center">
          <div className="flex gap-1 rounded-full border border-white/10 bg-black/30 p-1 text-xs">
            {tabs.map((t, i) => (
              <button key={t} onClick={() => setTab(i)} className={cn("rounded-full px-4 py-1.5 font-medium text-white/60", i === tab && "bg-forge text-white")}>{t}</button>
            ))}
          </div>
        </div>
      </main>
      <RightPanel />
    </div>
  );
}
