"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Copy, KeyRound, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { PageHeader } from "@/components/page-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/client";

type Token = { id: string; name: string; scopes: string[]; lastUsedAt: string | null; revoked: boolean };

function urlBase64ToUint8Array(b64: string) {
  const raw = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export default function SettingsPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [name, setName] = useState("");
  const [canWrite, setCanWrite] = useState(true);
  const [fresh, setFresh] = useState("");
  const [push, setPush] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => api<Token[]>("/tokens").then(setTokens).catch((e: Error) => setError(e.message)), []);
  useEffect(() => {
    void load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      const t = await api<{ token: string }>("/tokens", { method: "POST", body: JSON.stringify({ name: name.trim(), scopes: canWrite ? ["read", "write"] : ["read"] }) });
      setFresh(t.token);
      setName("");
      setError("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function enablePush() {
    try {
      const { publicKey } = (await (await fetch("/api/push/key")).json()).data as { publicKey: string | null };
      if (!publicKey) return setPush("O servidor ainda não tem chaves VAPID configuradas.");
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return setPush("Este navegador não suporta notificações push.");
      if ((await Notification.requestPermission()) !== "granted") return setPush("Permissão negada no navegador.");
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      await fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(sub) });
      setPush("Notificações ativadas neste dispositivo.");
    } catch {
      setPush("Não foi possível ativar as notificações.");
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <PageHeader title="Configurações" />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="flex items-center gap-2"><KeyRound aria-hidden="true" className="size-4" />Tokens da CLI</h2>
            <p className="text-sm text-muted-foreground">Use com <code translate="no">forge auth login</code>. O valor aparece só uma vez.</p>
          </div>
          <form onSubmit={create} className="flex flex-wrap items-center gap-2">
            <Label htmlFor="token-name" className="sr-only">Nome do token</Label>
            <Input id="token-name" name="name" autoComplete="off" spellCheck={false} required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: claude-code…" className="min-w-0 flex-1 basis-48" />
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={canWrite} onChange={(e) => setCanWrite(e.target.checked)} className="size-4 accent-primary" />
              Permitir escrita
            </Label>
            <Button type="submit">Gerar token</Button>
          </form>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {fresh && (
            <div role="status" className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 p-3">
              <code className="min-w-0 flex-1 text-xs break-all">{fresh}</code>
              <Button variant="ghost" size="icon-sm" aria-label="Copiar token" onClick={() => navigator.clipboard.writeText(fresh)}>
                <Copy aria-hidden="true" />
              </Button>
            </div>
          )}
          <ul className="flex flex-col gap-2">
            {tokens.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-2xl border bg-secondary/40 py-2 pr-1.5 pl-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.scopes.join(" · ")} · {t.id}</p>
                </div>
                {t.revoked ? <Badge variant="destructive">Revogado</Badge> : <ConfirmButton icon={Trash2} label={`Revogar token ${t.name}`} title="Revogar token?" description="Quem usa este token perde o acesso imediatamente." confirmLabel="Revogar" onConfirm={async () => { await api(`/tokens/${t.id}`, { method: "DELETE" }); await load(); }} />}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col items-start gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="flex items-center gap-2"><Bell aria-hidden="true" className="size-4" />Notificações</h2>
            <p className="text-sm text-muted-foreground">Receba seus lembretes como notificação do navegador.</p>
          </div>
          <Button variant="secondary" onClick={enablePush}>Ativar neste dispositivo</Button>
          {push && <p role="status" className="text-sm text-muted-foreground">{push}</p>}
        </CardContent>
      </Card>

      <Button variant="ghost" className="self-start text-muted-foreground" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login"; }}>
        Sair
      </Button>
    </div>
  );
}
