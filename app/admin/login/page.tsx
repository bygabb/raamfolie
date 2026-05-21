"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState(false);
  const [bezig, setBezig] = useState(false);

  async function inloggen(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: wachtwoord }),
      });
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      setFout(true);
    } catch {
      setFout(true);
    } finally {
      setBezig(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-2 p-4">
      <Card variant="white" className="w-full max-w-sm">
        <CardContent className="gap-5">
          <header className="flex flex-col gap-1">
            <h1 className="font-display text-xl font-semibold text-ink">
              Signs.nl admin
            </h1>
            <p className="text-sm text-body">
              Log in om aanvragen te bekijken.
            </p>
          </header>

          <form onSubmit={inloggen} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="wachtwoord" className="text-sm font-medium text-ink">
                Wachtwoord
              </Label>
              <Input
                id="wachtwoord"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={wachtwoord}
                aria-invalid={fout}
                onChange={(e) => {
                  setWachtwoord(e.target.value);
                  if (fout) setFout(false);
                }}
              />
              {fout && (
                <p className="text-xs text-destructive">Wachtwoord onjuist</p>
              )}
            </div>
            <Button type="submit" disabled={bezig || wachtwoord === ""}>
              {bezig ? "Bezig…" : "Inloggen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
