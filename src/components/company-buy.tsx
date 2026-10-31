import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { ArrowLeft, Check, CheckCircle2, CreditCard, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { companyBuySchema, type CompanyBuyInput } from "@/lib/company";
import { createCompanyCheckout } from "@/lib/payments.functions";
import { getStripe, getStripeEnvironment, paymentsConfigured } from "@/lib/stripe";
import { COMPANY_MAX_SEATS, companyMonthlyTotal, companyPricePerSeat, withVat } from "@/lib/subscription";
import { ProLoginBar } from "@/components/pro-login-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const kr = (n: number) => `${n.toLocaleString("sv-SE", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} kr`;

export function CompanyBuy() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ company_name: "", org_number: "", seats: "5" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [order, setOrder] = useState<CompanyBuyInput | null>(null);
  const [hasCompany, setHasCompany] = useState(false);

  useEffect(() => {
    if (!user) return;
    void supabase.from("companies").select("id").eq("admin_user_id", user.id).eq("status", "active").limit(1).maybeSingle()
      .then(({ data }) => setHasCompany(!!data));
  }, [user]);

  const seatsNum = Math.min(COMPANY_MAX_SEATS, Math.max(1, Math.floor(Number(form.seats) || 1)));
  const total = companyMonthlyTotal(seatsNum);
  const setSeats = (n: number) => setForm((f) => ({ ...f, seats: String(Math.min(COMPANY_MAX_SEATS, Math.max(1, n))) }));

  const fetchClientSecret = useCallback(async () => {
    if (!order) throw new Error("Ingen beställning");
    const r = await createCompanyCheckout({
      data: { environment: getStripeEnvironment(), returnUrl: `${window.location.origin}/konto?klart=1`, ...order },
    });
    if ("error" in r) throw new Error(r.error);
    return r.clientSecret;
  }, [order]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = companyBuySchema.safeParse(form);
    if (!p.success) {
      const errs: Record<string, string> = {};
      for (const i of p.error.issues) errs[String(i.path[0])] ??= i.message;
      return setErrors(errs);
    }
    setErrors({});
    setOrder(p.data);
  }

  if (loading) return null;
  if (!user) return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Logga in eller skapa konto först. Kontot du köper med blir företagets admin, och där lägger du till era tekniker.</p>
      <ProLoginBar />
    </div>
  );
  if (hasCompany) return (
    <div className="flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
      <div className="text-sm">
        <p className="font-bold">Ni har redan en företagslicens.</p>
        <p className="text-muted-foreground">Lägg till tekniker eller ändra antal under <Link to="/konto" className="font-semibold text-accent underline">Mitt konto</Link>.</p>
      </div>
    </div>
  );
  if (!paymentsConfigured()) return <p className="text-sm font-semibold text-destructive">Betalning är inte öppnad ännu.</p>;

  if (order) return (
    <div className="space-y-3">
      <button type="button" onClick={() => setOrder(null)} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />Ändra beställning
      </button>
      <p className="text-sm"><b>{order.company_name}</b> · {order.seats} tekniker × {companyPricePerSeat(order.seats)} kr = <b>{kr(companyMonthlyTotal(order.seats))}/mån</b> exkl. moms</p>
      <div className="overflow-hidden rounded-lg bg-card">
        <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="cb-name">Företagsnamn</Label>
          <Input id="cb-name" autoComplete="organization" value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} />
          {errors["company_name"] && <p className="text-xs font-medium text-destructive">{errors["company_name"]}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="cb-org">Org.nummer (valfritt)</Label>
          <Input id="cb-org" placeholder="556123-4567" autoComplete="off" value={form.org_number} onChange={(e) => setForm((f) => ({ ...f, org_number: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="cb-seats">Hur många tekniker är ni?</Label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="size-12 shrink-0" onClick={() => setSeats(seatsNum - 1)} aria-label="En färre"><Minus className="size-5" /></Button>
          <Input id="cb-seats" type="number" inputMode="numeric" min={1} max={COMPANY_MAX_SEATS} className="h-12 text-center text-xl font-extrabold"
            value={form.seats} onChange={(e) => setForm((f) => ({ ...f, seats: e.target.value }))} />
          <Button type="button" variant="outline" className="size-12 shrink-0" onClick={() => setSeats(seatsNum + 1)} aria-label="En till"><Plus className="size-5" /></Button>
        </div>
        {errors["seats"] && <p className="text-xs font-medium text-destructive">{errors["seats"]}</p>}
      </div>
      <div className="rounded-lg border border-accent/40 bg-accent/5 p-3 text-sm">
        <p>{seatsNum} tekniker × {companyPricePerSeat(seatsNum)} kr per månad</p>
        <p className="text-2xl font-extrabold">{kr(total)}<span className="text-base font-semibold text-muted-foreground"> per månad exkl. moms</span></p>
        <p className="text-xs text-muted-foreground">{kr(withVat(total))} per månad inkl. 25 % moms</p>
        <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold"><Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />Månadsabonnemang – dras automatiskt varje månad. Ingen bindningstid, säg upp när du vill.</p>
      </div>
      <Button type="submit" className="min-h-12 w-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/85">
        <CreditCard className="size-5" />Gå till betalning
      </Button>
      <p className="text-xs text-muted-foreground">Kort, Apple Pay eller Google Pay. Kvitto skickas till din mejl varje månad och finns som PDF under Mitt konto.</p>
    </form>
  );
}
