import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { ArrowLeft, Building2, Check, CreditCard, Download, ExternalLink, Printer, Receipt as ReceiptIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProLoginBar } from "@/components/pro-login-bar";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { getStripe, getStripeEnvironment, paymentsConfigured } from "@/lib/stripe";
import { createBillingPortal, createProCheckout, listReceipts, type Receipt } from "@/lib/payments.functions";
import { PRO_MONTHLY_SEK, withVat } from "@/lib/subscription";

export const Route = createFileRoute("/konto")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): { klart?: string | undefined } => ({ klart: s["klart"] != null ? String(s["klart"]) : undefined }),
  head: () => ({
    meta: [
      { title: "Mitt konto – Cylinderhjälpen Pro" },
      { name: "description", content: "Köp Cylinderhjälpen Pro, se ditt abonnemang och ladda ner kvitton." },
      { property: "og:title", content: "Mitt konto – Cylinderhjälpen Pro" },
      { property: "og:description", content: "Abonnemang och kvitton för Cylinderhjälpen Pro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("sv-SE") : "–");
const fmtKr = (n: number) => `${n.toLocaleString("sv-SE", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} kr`;

function AccountPage() {
  const { user, loading } = useAuth();
  const { klart } = Route.useSearch();
  const { sub, active, loading: subLoading, refresh } = useSubscription(user?.id);
  const [checkout, setCheckout] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Efter köp: webhooken kan ta några sekunder – fråga om igen.
  useEffect(() => {
    if (!klart || active) return;
    const t = setInterval(() => void refresh(), 2500);
    return () => clearInterval(t);
  }, [klart, active, refresh]);

  const loadReceipts = useCallback(async () => {
    if (!user || !paymentsConfigured()) return;
    const r = await listReceipts({ data: { environment: getStripeEnvironment() } });
    if ("error" in r) setErr(r.error);
    else setReceipts(r.receipts);
  }, [user]);

  useEffect(() => {
    if (sub) void loadReceipts();
  }, [sub, loadReceipts]);

  const fetchClientSecret = useCallback(async () => {
    const r = await createProCheckout({ data: { environment: getStripeEnvironment(), returnUrl: `${window.location.origin}/konto?klart=1` } });
    if ("error" in r) throw new Error(r.error);
    return r.clientSecret;
  }, []);

  const openPortal = async () => {
    const r = await createBillingPortal({ data: { environment: getStripeEnvironment(), returnUrl: window.location.href } });
    if ("error" in r) return setErr(r.error);
    window.open(r.url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <Link to="/pro" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Till Pro-kalkylen</Link>
        <h1 className="text-2xl font-extrabold">Mitt konto</h1>

        {loading ? null : !user ? (
          <>
            <p className="text-muted-foreground">Logga in eller skapa konto för att köpa Pro.</p>
            <ProLoginBar />
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Inloggad som <span className="font-semibold text-foreground">{user.email}</span></p>

            {klart && !active && <p className="rounded-lg border border-accent/40 bg-accent/5 p-3 text-sm font-medium">Tack! Vi aktiverar ditt abonnemang – det tar bara några sekunder…</p>}

            <section className="rounded-xl border border-accent/40 bg-accent/5 p-4 sm:p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold"><Star className="size-5 text-accent" />Cylinderhjälpen Pro</h2>
              {subLoading ? null : active && sub ? (
                <div className="mt-2 space-y-3 text-sm">
                  <p className="flex items-center gap-2 font-bold text-success"><Check className="size-4" />Aktivt abonnemang</p>
                  <p>
                    {sub.cancel_at_period_end || sub.status === "canceled"
                      ? <>Avslutat – Pro gäller till <b>{fmtDate(sub.current_period_end)}</b>.</>
                      : <>Förnyas <b>{fmtDate(sub.current_period_end)}</b> · {PRO_MONTHLY_SEK} kr/mån exkl. moms</>}
                  </p>
                  {sub.status === "past_due" && <p className="font-semibold text-destructive">Senaste betalningen gick inte igenom – uppdatera kortet.</p>}
                  <Button variant="outline" className="min-h-11 font-semibold" onClick={openPortal}><CreditCard className="size-4" />Hantera abonnemang och kort<ExternalLink className="size-3.5" /></Button>
                </div>
              ) : checkout ? (
                <div className="mt-3 overflow-hidden rounded-lg bg-card">
                  <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                </div>
              ) : (
                <div className="mt-2 space-y-3">
                  <p className="text-3xl font-extrabold">{PRO_MONTHLY_SEK} kr<span className="text-base font-semibold text-muted-foreground">/mån exkl. moms</span></p>
                  <p className="text-sm text-muted-foreground">{fmtKr(withVat(PRO_MONTHLY_SEK))} inkl. 25 % moms. Ingen bindningstid – avsluta när du vill. Kvitto skickas till din mejl efter varje betalning.</p>
                  {paymentsConfigured() ? (
                    <Button className="min-h-12 w-full bg-accent text-base font-bold text-accent-foreground hover:bg-accent/85" onClick={() => setCheckout(true)}>
                      <CreditCard className="size-5" />Köp Pro – {PRO_MONTHLY_SEK} kr/mån
                    </Button>
                  ) : (
                    <p className="text-sm font-semibold text-destructive">Betalning är inte öppnad ännu.</p>
                  )}
                  <p className="text-xs text-muted-foreground">Kort, Apple Pay och Google Pay. Säker betalning.</p>
                </div>
              )}
            </section>

            <Link to="/foretag" className="flex items-center gap-3 rounded-xl border bg-card p-3 text-sm shadow-card hover:bg-muted/40">
              <Building2 className="size-5 shrink-0 text-accent" />
              <span className="flex-1"><b>Är ni flera på företaget?</b> Företagslicens med mängdrabatt och samlad faktura.</span>
            </Link>

            {sub && (
              <section className="rounded-xl border bg-card p-4 shadow-card sm:p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold"><ReceiptIcon className="size-5 text-accent" />Kvitton</h2>
                {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
                {receipts === null ? <p className="mt-2 text-sm text-muted-foreground">Hämtar…</p> : receipts.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">Inga kvitton än.</p>
                ) : (
                  <ul className="mt-3 divide-y">
                    {receipts.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">{fmtDate(r.created)} · {fmtKr(r.amount)}</span>
                          <span className="block text-xs text-muted-foreground">{r.number ?? "Kvitto"} · {r.status === "paid" ? "Betald" : r.status === "open" ? "Obetald" : r.status}</span>
                        </span>
                        {r.pdfUrl && <Button asChild size="sm" variant="outline"><a href={r.pdfUrl} target="_blank" rel="noopener noreferrer"><Download className="size-4" />PDF</a></Button>}
                        {r.hostedUrl && <Button asChild size="sm" variant="outline"><a href={r.hostedUrl} target="_blank" rel="noopener noreferrer"><Printer className="size-4" />Visa/skriv ut</a></Button>}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
