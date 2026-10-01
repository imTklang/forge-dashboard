"use client";

import { useEffect, useState } from "react";
import { TIMEZONE } from "@forge/core";
import { currentHour } from "@/lib/format";

/** Saudação por horário. Calculada após a montagem para não divergir entre servidor e cliente. */
export function useGreeting() {
  const [state, setState] = useState<{ hello: string; date: string } | null>(null);
  useEffect(() => {
    const h = currentHour();
    const date = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: TIMEZONE }).format(new Date());
    setState({ hello: h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite", date });
  }, []);
  return state;
}

export function GreetingHeader() {
  const g = useGreeting();
  return (
    <header className="flex flex-col gap-1">
      <h1>{g?.hello ?? "Olá"}, Enzo</h1>
      <p className="min-h-5 text-sm text-muted-foreground first-letter:uppercase">{g?.date}</p>
    </header>
  );
}
