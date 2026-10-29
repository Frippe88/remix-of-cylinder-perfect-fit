import { useState } from "react";
import { KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "in" | "up" | "forgot";

export function AuthForm({ initialMode }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode ?? "in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/pro` },
        });
        if (error) throw error;
        if (!data.session) setMsg({ kind: "ok", text: "Kolla din mejl och klicka på länken för att aktivera kontot." });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setMsg({ kind: "ok", text: "Vi har skickat en länk för att välja nytt lösenord." });
      }
    } catch (err) {
      const e = err as { message?: string; code?: string; status?: number };
      const m = e?.message ?? "";
      const c = e?.code ?? "";
      setMsg({ kind: "err", text: authErrorText(m, c, e?.status) });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setMsg(null);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/pro` });
    if (r.error) setMsg({ kind: "err", text: "Google-inloggningen misslyckades. Försök igen." });
  }

  const title = mode === "in" ? "Logga in till Pro" : mode === "up" ? "Skapa konto" : "Glömt lösenord";

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border bg-card p-5 shadow-elevated">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent">
          <KeyRound className="size-5 text-accent-foreground" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-extrabold leading-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">Pro kräver ett konto. Gratisversionen fungerar utan.</p>
        </div>
      </div>

      {mode !== "forgot" && (
        <>
          <Button type="button" variant="outline" className="w-full" onClick={google}>
            Fortsätt med Google
          </Button>
          <div className="my-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />eller med mejl<span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="auth-email">Mejl</Label>
          <Input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {mode !== "forgot" && (
          <div className="space-y-1">
            <Label htmlFor="auth-pw">Lösenord</Label>
            <Input id="auth-pw" type="password" minLength={6} required autoComplete={mode === "up" ? "new-password" : "current-password"}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        )}
        {msg && (
          <p className={`text-sm font-medium ${msg.kind === "err" ? "text-destructive" : "text-foreground"}`}>{msg.text}</p>
        )}
        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={busy}>
          {mode === "in" ? "Logga in" : mode === "up" ? "Skapa konto" : "Skicka länk"}
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
        {mode === "in" ? (
          <>
            <button type="button" className="font-semibold text-accent underline-offset-2 hover:underline" onClick={() => setMode("up")}>Skapa konto</button>
            <button type="button" className="text-muted-foreground hover:underline" onClick={() => setMode("forgot")}>Glömt lösenord?</button>
          </>
        ) : (
          <button type="button" className="font-semibold text-accent underline-offset-2 hover:underline" onClick={() => setMode("in")}>Tillbaka till inloggning</button>
        )}
      </div>
    </div>
  );
}
