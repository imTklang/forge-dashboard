"use client";

import { motion } from "motion/react";
import { LayoutGrid, HeartPulse, FolderKanban, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { icon: LayoutGrid, label: "Hoje" },
  { icon: HeartPulse, label: "Saúde" },
  { icon: FolderKanban, label: "Projetos" },
  { icon: Bell, label: "Lembretes" },
  { icon: Settings, label: "Configurações" },
];

export function Sidebar({ active, onChange }: { active: number; onChange: (i: number) => void }) {
  return (
    <>
      {/* desktop */}
      <nav className="hidden w-16 shrink-0 flex-col items-center gap-4 rounded-full border border-white/10 bg-white/5 py-6 backdrop-blur-xl lg:flex">
        <div className="mb-4 text-xl font-black text-forge">F</div>
        {items.map(({ icon: Icon, label }, i) => (
          <motion.button
            key={label}
            aria-label={label}
            title={label}
            whileHover={{ scale: 1.1 }}
            onClick={() => onChange(i < 3 ? i : active)}
            className={cn(
              "grid size-10 place-items-center rounded-full text-white/60 transition-colors",
              i === active && "bg-forge text-white shadow-lg shadow-forge/40",
            )}
          >
            <Icon size={18} />
          </motion.button>
        ))}
      </nav>
      {/* mobile bottom nav */}
      <nav className="fixed inset-x-3 bottom-3 z-50 flex justify-around rounded-full border border-white/10 bg-black/40 p-2 backdrop-blur-xl lg:hidden">
        {items.map(({ icon: Icon, label }, i) => (
          <button
            key={label}
            aria-label={label}
            onClick={() => onChange(i < 3 ? i : active)}
            className={cn("grid size-10 place-items-center rounded-full text-white/60", i === active && "bg-forge text-white")}
          >
            <Icon size={18} />
          </button>
        ))}
      </nav>
    </>
  );
}
