"use client";

import { useEffect, useState } from "react";
import { AgentBadge } from "./agent-badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/client";

type Msg = { text: string; source: "agent" | "rule"; createdAt: string | null };

export function MotivationCard() {
  const [msg, setMsg] = useState<Msg | null>(null);
  useEffect(() => {
    api<Msg>("/motivation").then(setMsg).catch(() => {});
  }, []);

  return (
    <Card className="border-primary/30 bg-primary/10">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2>Mensagem do dia</h2>
          {msg?.source === "agent" && <AgentBadge at={msg.createdAt} />}
        </div>
        <p className="text-base text-pretty">{msg?.text ?? "Carregando…"}</p>
      </CardContent>
    </Card>
  );
}
