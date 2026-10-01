"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Copy, KeyRound, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { api as call } from "@/lib/client";

function urlBase64ToUint8Array(b64: string) {
  const raw = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

type Tok = { id: string; name: string; scopes: string[]; lastUsedAt: string | null; revoked: boolean };

export default function Settings() {
  const [tokens, setTokens] = useState<Tok[]>([]);
  const [name, setName] = useState("");
  const [write, setWrite] = useState(true);
  const [fresh, setFresh] = useState("");
  const [push, setPush] = useState("");

  async function enablePush() {
    try {
      const { publicKey } = (await (await fetch("/api/push/key")).json()).data as { publicKey: string | null };
      if (!publicKey) return setPush("VAPID não configurado no servidor (veja .env.example).");
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return setPush("Este navegador não suporta Web Push.");
      if ((await Notification.requestPermission()) !== "granted") return setPush("Permissão negada.");
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      await fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub) });
      setPush("Notificações ativadas neste dispositivo.");
    } catch {
      setPush("Não foi possível ativar as notificações.");
    }
  }

  const load = useCallback(async () => setTokens(await call<Tok[]>("/tokens")), []);
  useEffect(() => { void load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const t = await call<{ token: string }>("/tokens", { method: "POST", body: JSON.stringify({ name, scopes: write ? ["read", "write"] : ["read"] }) });
    setFresh(t.token);
    setName("");
    await load();
  }

  return (
    <main className="mx-auto max-w-2xl p-4 lg:p-8">
      <a href="/" className="text-xs text-white/50">← Voltar</a>
      <h1 className="mb-6 mt-2 text-xl font-bold">Configurações</h1>
      <GlassCard className="p-6">
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold"><KeyRound size={14} />Tokens da CLI / agentes</p>
        <p className="mb-4 text-xs text-white/50">Use com <code>forge auth login --url … --token …</code>. O token só aparece uma vez.</p>
        <form onSubmit={create} className="mb-4 flex flex-wrap items-center gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (ex.: claude-code)" required className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs outline-none" />
          <label className="flex items-center gap-1 text-xs text-white/60"><input type="checkbox" checked={write} onChange={(e) => setWrite(e.target.checked)} />escrita</label>
          <button className="rounded-full bg-forge px-4 py-2 text-xs font-semibold">Gerar</button>
        </form>
        {fresh && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-forge/40 bg-forge/10 p-3 text-xs">
            <code className="min-w-0 flex-1 break-all">{fresh}</code>
            <button onClick={() => navigator.clipboard.writeText(fresh)} aria-label="Copiar"><Copy size={14} /></button>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {tokens.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs">
              <span>{t.name} <span className="text-white/40">· {t.scopes.join(",")} · {t.id}</span>{t.revoked && <span className="ml-2 text-bad">revogado</span>}</span>
              {!t.revoked && <button aria-label="Revogar" onClick={async () => { await call(`/tokens/${t.id}`, { method: "DELETE" }); await load(); }}><Trash2 size={14} className="text-white/40 hover:text-bad" /></button>}
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="mt-4 p-6">
        <p className="mb-1 flex items-center gap-2 text-sm font-semibold"><Bell size={14} />Notificações</p>
        <p className="mb-3 text-xs text-white/50">Receba seus lembretes como notificação do navegador.</p>
        <button onClick={enablePush} className="rounded-full bg-forge px-4 py-2 text-xs font-semibold">Ativar neste dispositivo</button>
        {push && <p className="mt-2 text-xs text-white/60">{push}</p>}
      </GlassCard>
      <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login"; }} className="mt-4 text-xs text-white/50">Sair</button>
    </main>
  );
}
