import { useState } from "react";
import { Check, ChevronRight, Cloud, KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanySection } from "@/components/company-section";
import { ProDialog } from "@/components/pro-dialog";

export function AccountPanel({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [changing, setChanging] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [cur, setCur] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!cur) return setMsg({ ok: false, text: "Fyll i ditt nuvarande lösenord." });
    if (pw.length < 8) return setMsg({ ok: false, text: "Lösenordet måste vara minst 8 tecken." });
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: pw, current_password: cur });
    setBusy(false);
    if (error) {
      if (/current password|invalid|incorrect|credentials/i.test(error.message) && !/weak|pwned/i.test(error.message))
        return setMsg({ ok: false, text: "Nuvarande lösenord stämmer inte." });
      const weak = /weak|pwned|leaked|known/i.test(error.message);
      return setMsg({ ok: false, text: weak ? "För enkelt eller läckt lösenord. Välj ett starkare." : "Kunde inte byta lösenord. Försök igen." });
    }
    setPw("");
    setCur("");
    setChanging(false);
    setMsg({ ok: true, text: "Lösenordet är bytt." });
  }

  const initial = (email.trim()[0] ?? "?").toUpperCase();
  return (
    <div>
      <div className="flex items-center gap-3 border-b bg-accent/10 p-5 pr-12">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-extrabold text-accent-foreground shadow-card">{initial}</div>
        <div className="min-w-0">
          <p className="text-base font-extrabold leading-tight">Mitt konto</p>
          <p className="truncate text-sm text-muted-foreground">{email}</p>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
            <ShieldCheck className="size-3" aria-hidden /> Pro • Beta
          </span>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3">
          <Cloud className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold"><span className="size-2 rounded-full bg-success" aria-hidden />Molnsynk aktiv</p>
            <p className="text-xs text-muted-foreground">Dina projekt följer med mellan telefon och dator.</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold">Prenumeration</p>
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">Gratis under beta</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {["Molnsynk", "Automatisk skruvlängd", "Flera projekt & PDF"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><Check className="size-3.5 text-accent" aria-hidden />{t}</li>
            ))}
          </ul>
          <button type="button" onClick={() => setProOpen(true)} className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-bold text-accent hover:bg-accent/15">
            Se allt som ingår i Pro<ChevronRight className="size-4" aria-hidden />
          </button>
          <ProDialog open={proOpen} onOpenChange={setProOpen} />
        </div>
        <CompanySection email={email} />



        <div className="rounded-lg border bg-card p-3">
          {changing ? (
            <form onSubmit={save} className="space-y-2">
              <p className="flex items-center gap-1.5 text-sm font-bold"><KeyRound className="size-4 text-accent" aria-hidden />Byt lösenord</p>
              <Label htmlFor="acc-cur-pw" className="sr-only">Nuvarande lösenord</Label>
              <Input id="acc-cur-pw" type="password" placeholder="Nuvarande lösenord" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} />
              <Label htmlFor="acc-new-pw" className="sr-only">Nytt lösenord</Label>
              <Input id="acc-new-pw" type="password" placeholder="Nytt lösenord (minst 8 tecken)" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
              <div className="flex gap-2">
                <Button type="submit" disabled={busy} className="min-h-10 flex-1 bg-accent font-semibold text-accent-foreground hover:bg-accent/90">Spara</Button>
                <Button type="button" variant="outline" className="min-h-10" onClick={() => { setChanging(false); setPw(""); setCur(""); setMsg(null); }}>Avbryt</Button>
              </div>
            </form>
          ) : (
            <button type="button" className="flex w-full items-center gap-2 text-left text-sm font-bold" onClick={() => { setChanging(true); setMsg(null); }}>
              <KeyRound className="size-4 text-accent" aria-hidden /><span className="flex-1">Byt lösenord</span><ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </button>
          )}
          {msg && <p className={`mt-2 text-sm font-medium ${msg.ok ? "text-success" : "text-destructive"}`}>{msg.text}</p>}
        </div>

        <Button type="button" variant="ghost" className="min-h-10 w-full font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={onSignOut}>
          <LogOut className="size-4" aria-hidden /> Logga ut
        </Button>
      </div>
    </div>
  );
}
