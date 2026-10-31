import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, CalendarCheck, Check, Receipt, Star, Users } from "lucide-react";
import { CompanyApplyForm } from "@/components/company-apply-form";

export const Route = createFileRoute("/foretag")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Företagslicens – Cylinderhjälpen Pro för hela teamet" },
      { name: "description", content: "Ge alla era låssmeder Cylinderhjälpen Pro. Samlad faktura, admin för teamet och 30 dagars provperiod." },
      { property: "og:title", content: "Företagslicens – Cylinderhjälpen Pro för hela teamet" },
      { property: "og:description", content: "Samlad faktura och adminpanel där chefen lägger till och tar bort tekniker." },
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
  { icon: Receipt, title: "Samlad årsfaktura", text: "Alla licenser på en faktura till företaget – inga privata kortköp eller kvitton från bilarna." },
  { icon: CalendarCheck, title: "30 dagar gratis", text: "Hela teamet kör skarpt i 30 dagar utan bindningstid eller förskott." },
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
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <Link to="/pro" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Tillbaka</Link>
        <header className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent"><Building2 className="size-3.5" />Företagslicens · Beta</span>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Cylinderhjälpen Pro för hela teamet</h1>
          <p className="text-muted-foreground">Skicka in en ansökan så hör vi av oss och sätter upp ert företagskonto.</p>
        </header>
        <ul className="grid gap-2 sm:grid-cols-3">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-lg border bg-card p-3">
              <p className="flex items-center gap-2 text-sm font-bold"><Icon className="size-4 shrink-0 text-accent" />{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
        <section className="rounded-xl border border-accent/40 bg-accent/5 p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Star className="size-5 text-accent" />Det här får era låssmeder</h2>
          <ul className="mt-3 space-y-2 text-sm font-medium">
            {PRO.map((p) => <li key={p} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-accent" />{p}</li>)}
          </ul>
        </section>
        <section className="rounded-xl border bg-card p-4 shadow-card sm:p-5">
          <h2 className="mb-3 text-lg font-bold">Ansök om företagskonto</h2>
          <CompanyApplyForm />
        </section>
      </main>
    </div>
  );
}
