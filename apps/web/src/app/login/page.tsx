"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ password }) });
    if (res.ok) location.href = "/";
    else {
      setError("Senha incorreta. Tente novamente.");
      setSending(false);
    }
  }

  return (
    <main id="main" className="grid min-h-dvh place-items-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-primary" translate="no">Forge</h1>
              <p className="text-sm text-muted-foreground">Entre com a sua senha.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" spellCheck={false} required aria-invalid={!!error} aria-describedby={error ? "login-error" : undefined} />
              {error && <p id="login-error" role="alert" className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" size="lg" disabled={sending}>{sending ? "Entrando…" : "Entrar"}</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
