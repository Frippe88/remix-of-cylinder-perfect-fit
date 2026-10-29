import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Nytt lösenord – Cylinderhjälpen" },
      { name: "description", content: "Välj ett nytt lösenord för ditt Cylinderhjälpen-konto." },
      { property: "og:title", content: "Nytt lösenord – Cylinderhjälpen" },
      { property: "og:description", content: "Välj ett nytt lösenord för ditt Cylinderhjälpen-konto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setErr("Länken har gått ut eller något gick fel. Begär en ny länk.");
    navigate({ to: "/pro", replace: true });
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-card p-5 shadow-elevated">
        <h1 className="text-lg font-extrabold">Välj nytt lösenord</h1>
        <div className="space-y-1">
          <Label htmlFor="new-pw">Nytt lösenord</Label>
          <Input id="new-pw" type="password" minLength={6} required autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        {err && <p className="text-sm font-medium text-destructive">{err}</p>}
        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={busy}>Spara lösenord</Button>
      </form>
    </main>
  );
}
