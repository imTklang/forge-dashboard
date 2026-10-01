"use client";

import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";

export default function LoginPage() {
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ password }) });
    if (res.ok) location.href = "/";
    else setError("Senha incorreta");
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <GlassCard className="w-full max-w-sm p-8">
        <h1 className="mb-1 text-2xl font-black text-forge">Forge</h1>
        <p className="mb-6 text-sm text-white/50">Entre com sua senha</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input name="password" type="password" autoFocus placeholder="Senha" className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm outline-none" />
          {error && <p className="text-xs text-bad">{error}</p>}
          <button className="rounded-full bg-forge py-2 text-sm font-semibold">Entrar</button>
        </form>
      </GlassCard>
    </main>
  );
}
