import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccountPanel({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [changing, setChanging] = useState(false);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setMsg({ ok: false, text: "Lösenordet måste vara minst 8 tecken." });
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      const weak = /weak|pwned|leaked|known/i.test(error.message);
      return setMsg({ ok: false, text: weak ? "För enkelt eller läckt lösenord. Välj ett starkare." : "Kunde inte byta lösenord. Försök igen." });
    }
    setPw("");
    setChanging(false);
    setMsg({ ok: true, text: "Lösenordet är bytt." });
  }

  return (
    <div className="divide-y">
      <div className="space-y-3 p-5">
        <p className="text-base font-extrabold">Mitt konto</p>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">E-post</p>
          <p className="truncate text-sm font-medium">{email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Status</p>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">
            <ShieldCheck className="size-3.5" /> Pro-användare • Aktiv (Beta)
          </span>
        </div>
      </div>
      <div className="space-y-1 p-5">
        <p className="text-xs font-semibold text-muted-foreground">Prenumeration</p>
        <p className="text-sm font-medium">Kostnadsfritt under beta</p>
        <p className="text-xs text-muted-foreground">Kvitton och betalning hanteras här när betalning är på plats.</p>
      </div>
      <div className="space-y-2 p-5">
        <p className="text-xs font-semibold text-muted-foreground">Lösenord</p>
        {changing ? (
          <form onSubmit={save} className="space-y-2">
            <Label htmlFor="acc-new-pw" className="sr-only">Nytt lösenord</Label>
            <Input id="acc-new-pw" type="password" placeholder="Nytt lösenord" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <div className="flex gap-2">
              <Button type="submit" disabled={busy} className="min-h-10 flex-1 bg-accent font-semibold text-accent-foreground hover:bg-accent/90">Spara</Button>
              <Button type="button" variant="outline" className="min-h-10" onClick={() => { setChanging(false); setPw(""); setMsg(null); }}>Avbryt</Button>
            </div>
          </form>
        ) : (
          <Button type="button" variant="outline" className="min-h-10 w-full font-semibold" onClick={() => { setChanging(true); setMsg(null); }}>Byt lösenord</Button>
        )}
        {msg && <p className={`text-sm font-medium ${msg.ok ? "text-success" : "text-destructive"}`}>{msg.text}</p>}
      </div>
      <div className="p-5">
        <Button type="button" variant="outline" className="min-h-10 w-full font-semibold" onClick={onSignOut}>Logga ut</Button>
      </div>
    </div>
  );
}
