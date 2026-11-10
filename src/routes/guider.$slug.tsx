import { ArrowRight, Calculator, Lightbulb, TriangleAlert } from "lucide-react";
import { cardLift, SitePageHeader } from "@/components/site-page";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GUIDES, getGuide } from "@/lib/guides";

const BASE = "https://cylinderhjalpen.se/guider/";

export const Route = createFileRoute("/guider/$slug")({
  staticData: { sitemap: true },
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Guiden hittades inte – Cylinderhjälpen" }, { name: "robots", content: "noindex" }] };
    const url = BASE + params.slug;
    return {
      meta: [
        { title: `${loaderData.title} – Cylinderhjälpen` },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: loaderData.title, description: loaderData.description, inLanguage: "sv" }) }],
    };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <p>Guiden hittades inte.</p>
      <Link to="/guider" className="underline">Alla guider</Link>
    </main>
  ),
  component: GuidePage,
});

function GuidePage() {
  const g = Route.useLoaderData();
  const others = GUIDES.filter((o) => o.slug !== g.slug);
  return (
    <>
      <SitePageHeader backTo="/guider" backLabel="Alla guider" />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <article>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Guide</span>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{g.title}</h1>
          <div className="mt-6 flex gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-5">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-accent" />
            <p className="text-base font-medium sm:text-lg">{g.answer}</p>
          </div>
          {g.sections.map((s) => (
            <section key={s.heading} className="mt-8">
              <h2 className="text-xl font-bold tracking-tight">{s.heading}</h2>
              {s.body.map((p) => <p key={p} className="mt-2 leading-relaxed text-foreground/85">{p}</p>)}
            </section>
          ))}
          <section className="mt-8 rounded-2xl border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-xl font-bold"><TriangleAlert className="size-5 text-accent" />Vanliga misstag</h2>
            <ul className="mt-3 space-y-2">{g.mistakes.map((m) => <li key={m} className="flex gap-2 text-sm leading-relaxed"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />{m}</li>)}</ul>
          </section>
          <section className="mt-8 rounded-2xl border border-l-4 border-l-accent bg-card p-6 shadow-card">
            <h2 className="text-xl font-bold">Undvik misstagen – låt kalkylatorn räkna</h2>
            <p className="mt-2 text-muted-foreground">Kalkylatorn väger ihop cylinder, förlängare och ringar åt dig och kontrollerar avvikelsen mot regeln för cylindertypen. Du slipper huvudräkningen och misstagen ovan, och ser direkt vilken kombination som ger snyggast montage.</p>
            <Link to="/" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-card transition-transform hover:-translate-y-0.5"><Calculator className="size-4" />Beräkna mitt montage</Link>
          </section>
        </article>
        <aside className="mt-12">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Fler guider</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {others.map((o) => (
              <li key={o.slug}><Link to="/guider/$slug" params={{ slug: o.slug }} className={`group flex items-center justify-between gap-2 p-4 text-sm font-semibold ${cardLift}`}>{o.title}<ArrowRight className="size-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" /></Link></li>
            ))}
          </ul>
        </aside>
      </main>
    </>
  );
}
