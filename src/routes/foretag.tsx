import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Check } from "lucide-react";
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
  "Pro för alla era tekniker – rabatt per licens",
  "Samlad årsfaktura till företaget",
  "Adminpanel: lägg till och ta bort tekniker själv",
  "30 dagars provperiod – gratis under beta",
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
        <ul className="grid gap-2 sm:grid-cols-2">
          {PERKS.map((p) => <li key={p} className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm font-medium"><Check className="mt-0.5 size-4 shrink-0 text-accent" />{p}</li>)}
        </ul>
        <section className="rounded-xl border bg-card p-4 shadow-card sm:p-5">
          <h2 className="mb-3 text-lg font-bold">Ansök om företagskonto</h2>
          <CompanyApplyForm />
        </section>
      </main>
    </div>
  );
}
