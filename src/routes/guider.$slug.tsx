import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GUIDES, getGuide } from "@/lib/guides";

const BASE = "https://xn--cylinderhjlpen-fib.se/guider/";

export const Route = createFileRoute("/guider/$slug")({
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
    <main className="mx-auto max-w-2xl px-4 py-8">
      <nav className="text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">Kalkylatorn</Link> / <Link to="/guider" className="hover:underline">Guider</Link>
      </nav>
      <article className="mt-4">
        <h1 className="text-3xl font-bold">{g.title}</h1>
        <p className="mt-4 rounded-lg border-l-4 border-primary bg-card p-4 text-lg">{g.answer}</p>
        {g.sections.map((s) => (
          <section key={s.heading} className="mt-6">
            <h2 className="text-xl font-semibold">{s.heading}</h2>
            {s.body.map((p) => <p key={p} className="mt-2">{p}</p>)}
          </section>
        ))}
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Vanliga misstag</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">{g.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
        </section>
        <Link to="/" className="mt-8 inline-block rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground">Beräkna mitt montage</Link>
      </article>
      <aside className="mt-10 border-t pt-6">
        <h2 className="font-semibold">Fler guider</h2>
        <ul className="mt-2 space-y-1">
          {others.map((o) => (
            <li key={o.slug}><Link to="/guider/$slug" params={{ slug: o.slug }} className="text-primary hover:underline">{o.title}</Link></li>
          ))}
        </ul>
      </aside>
    </main>
  );
}
