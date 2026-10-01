export function AgentBadge({ at }: { at: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
      via agente · {at}
    </span>
  );
}
