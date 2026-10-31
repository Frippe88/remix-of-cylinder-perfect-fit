import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Check, Mail, Receipt, Star, Users, Zap } from "lucide-react";
import { CompanyBuy } from "@/components/company-buy";
import { CONTACT_EMAIL } from "@/components/contact-form";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import { COMPANY_TIERS, PRO_MONTHLY_SEK, companyMonthlyTotal, companyPricePerSeat } from "@/lib/subscription";

export const Route = createFileRoute("/foretag")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Företagslicens – Cylinderhjälpen Pro för hela företaget" },
      { name: "description", content: "Ge alla era låssmeder Cylinderhjälpen Pro. Välj antal tekniker, betala direkt och få mängdrabatt." },
      { property: "og:title", content: "Företagslicens – Cylinderhjälpen Pro för hela företaget" },
      { property: "og:description", content: "Välj antal tekniker, betala direkt och lägg till era låssmeder i adminpanelen." },
      { property: "og:url", content: "https://cylinderhjalpen.se/foretag" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://cylinderhjalpen.se/foretag" }],
  }),
  component: CompanyPage,
});

const PERKS = [
  { icon: Users, title: "Egen adminpanel", text: "Bjud in och ta bort låssmeder med ett klick. Börjar eller slutar någon styr du licensen direkt." },
  { icon: Receipt, title: "Ett kvitto för alla", text: "Alla licenser på samma betalning och samma kvitto varje månad – som PDF eller utskrift." },
  { icon: Zap, title: "Igång direkt", text: "Välj antal, betala och lägg till era låssmeder. Ingen ansökan, ingen väntan." },
];

const PRO = [
  "Automatisk skruvlängd – oval, rund och iLOQ, med varning när 63mm inte räcker",
  "Färdig inköpslista per oval, rund och iLOQ – ringar, förlängare och satser",
  "PDF med ett klick – komplett dörrlista eller bara inköpslista",
  "Behör direkt i kalkylen – färdig sats 256, 2356, 18256 eller lös ring",
  "Molnsynk och flera projekt – mät i mobilen, se bygget på datorn",
  "Kopiera beställningen till mejl/SMS",
];

function CompanyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <Link to="/pro" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Tillbaka</Link>
        <header className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent"><Building2 className="size-3.5" />Företagslicens · Beta</span>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Cylinderhjälpen Pro för hela företaget</h1>
          <p className="text-muted-foreground">Välj hur många ni är, betala direkt och lägg sedan till era låssmeder.</p>
        </header>
        <ul className="grid gap-2 sm:grid-cols-3">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-lg border bg-card p-3">
              <p className="flex items-center gap-2 text-sm font-bold"><Icon className="size-4 shrink-0 text-accent" />{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
        <section className="rounded-xl border bg-card p-4 shadow-card sm:p-5">
          <h2 className="text-lg font-bold">Priser – billigare ju fler ni är</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pris per tekniker och månad, exkl. moms. Priset gäller alla licenser – är ni 12 betalar alla 129 kr.</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {COMPANY_TIERS.map((t) => (
              <li key={t.min} className="rounded-lg border border-accent/40 bg-accent/5 p-3 text-center">
                <p className="text-sm font-semibold text-muted-foreground">{t.max ? `${t.min}–${t.max}` : `${t.min}+`} tekniker</p>
                <p className="text-2xl font-extrabold">{t.price} kr</p>
                <p className="text-xs text-muted-foreground">per tekniker/mån</p>
                {t.price < PRO_MONTHLY_SEK && <p className="mt-1 text-xs font-bold text-accent">Spara {Math.round((1 - t.price / PRO_MONTHLY_SEK) * 100)} %</p>}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm">Exempel: 12 tekniker = 12 × {companyPricePerSeat(12)} kr = <b>{companyMonthlyTotal(12).toLocaleString("sv-SE")} kr/mån</b> exkl. moms.</p>
          <p className="mt-1 text-xs text-muted-foreground">Bara du själv? <Link to="/konto" className="font-semibold text-accent underline">Köp Pro direkt med kort</Link> – {PRO_MONTHLY_SEK} kr/mån.</p>
        </section>
        <section className="rounded-xl border border-accent/40 bg-accent/5 p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Star className="size-5 text-accent" />Det här får era låssmeder</h2>
          <ul className="mt-3 space-y-2 text-sm font-medium">
            {PRO.map((p) => <li key={p} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-accent" />{p}</li>)}
          </ul>
        </section>
        <section className="rounded-xl border bg-card p-4 shadow-card sm:p-5">
          <h2 className="mb-3 text-lg font-bold">Köp företagslicens</h2>
          <CompanyBuy />
        </section>
        <section className="flex items-start gap-3 rounded-xl border bg-card p-4 text-sm">
          <Mail className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <p>Vill ni diskutera pris, samarbete eller något annat? Mejla oss på <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent underline">{CONTACT_EMAIL}</a>.</p>
        </section>
      </main>
    </div>
  );
}
