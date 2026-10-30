import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { applicationSchema } from "@/lib/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FIELDS = [
  ["company_name", "Företagsnamn", "Skåne Lås AB", "organization"],
  ["org_number", "Org.nummer (valfritt)", "556677-8899", "off"],
  ["contact_name", "Kontaktperson", "För- och efternamn", "name"],
  ["phone", "Telefon", "070-123 45 67", "tel"],
  ["email", "E-post (blir admin-konto)", "vd@foretag.se", "email"],
  ["seats", "Antal tekniker", "10", "off"],
] as const;

export function CompanyApplyForm() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [fail, setFail] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] ??= i.message;
      return setErrors(errs);
    }
    setErrors({});
    setBusy(true);
    setFail(null);
    const d = parsed.data;
    const { error } = await supabase.from("company_applications").insert({
      ...d, org_number: d.org_number || null, message: d.message || null,
    });
    setBusy(false);
    if (error) return setFail("Kunde inte skicka ansökan. Försök igen.");
    setDone(true);
  }

  if (done) return (
    <div className="flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
      <div>
        <p className="font-bold">Tack! Vi har tagit emot er ansökan.</p>
        <p className="text-sm text-muted-foreground">Vi hör av oss inom 24 timmar för att aktivera er provperiod.</p>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map(([k, label, ph, ac]) => (
          <div key={k} className="space-y-1">
            <Label htmlFor={`ca-${k}`}>{label}</Label>
            <Input id={`ca-${k}`} placeholder={ph} autoComplete={ac}
              type={k === "email" ? "email" : k === "phone" ? "tel" : k === "seats" ? "number" : "text"}
              inputMode={k === "seats" ? "numeric" : undefined}
              value={form[k] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
            {errors[k] && <p className="text-xs font-medium text-destructive">{errors[k]}</p>}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <Label htmlFor="ca-message">Övrigt (valfritt)</Label>
        <Textarea id="ca-message" rows={3} maxLength={1000} value={form["message"] ?? ""} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
      </div>
      {fail && <p className="text-sm font-medium text-destructive">{fail}</p>}
      <Button type="submit" disabled={busy} className="min-h-11 w-full bg-accent font-bold text-accent-foreground hover:bg-accent/90">
        {busy ? "Skickar…" : "Ansök om företagskonto"}
      </Button>
    </form>
  );
}
