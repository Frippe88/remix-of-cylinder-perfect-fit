import { createFileRoute, Link } from "@tanstack/react-router";
import { GUIDES } from "@/lib/guides";

const URL = "https://cylinderhjalpen.se/guider";

export const Route = createFileRoute("/guider/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Guider om cylindermontage – Cylinderhjälpen" },
      { name: "description", content: "Praktiska guider för låssmeder: cylinderlängd, ringar, förlängare, dubbelcylinder, iLOQ och rund cylinder." },
      { property: "og:title", content: "Guider om cylindermontage – Cylinderhjälpen" },
      { property: "og:description", content: "Praktiska guider om cylinderlängd, ringar och förlängare." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: GuideIndex,
});

function GuideIndex() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">← Till kalkylatorn</Link>
      <h1 className="mt-4 text-3xl font-bold">Guider om cylindermontage</h1>
      <p className="mt-2 text-muted-foreground">Korta svar på vanliga frågor ute på jobbet.</p>
      <ul className="mt-6 space-y-3">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link to="/guider/$slug" params={{ slug: g.slug }} className="block rounded-lg border bg-card p-4 hover:border-primary">
              <span className="font-semibold">{g.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{g.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
