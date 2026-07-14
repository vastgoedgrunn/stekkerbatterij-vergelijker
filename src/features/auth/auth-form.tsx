"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Mode = "signin" | "signup";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const configured = isSupabaseConfigured();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);

    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Bevestig je e-mailadres via de link die we je hebben gestuurd.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setPending(false);
    }
  }

  if (!configured) {
    return (
      <p className="text-muted-foreground border-border rounded-lg border border-dashed p-4 text-sm">
        Inloggen is nog niet beschikbaar omdat de database nog niet gekoppeld is.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border-border space-y-4 rounded-xl border p-6">
      <div className="space-y-2">
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Wachtwoord</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {message && <p className="text-success text-sm">{message}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Bezig…" : mode === "signin" ? "Inloggen" : "Account aanmaken"}
      </Button>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "signin" ? "signup" : "signin"));
          setError(null);
          setMessage(null);
        }}
        className="text-muted-foreground w-full text-center text-sm hover:underline"
      >
        {mode === "signin" ? "Nog geen account? Registreren" : "Al een account? Inloggen"}
      </button>
    </form>
  );
}
