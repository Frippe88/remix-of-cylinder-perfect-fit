import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { GUIDES } from "@/lib/guides";
import { cardLift, PageHero, SitePageHeader } from "@/components/site-page";

const URL = "https://cylinderhjalpen.se/guider";

export const Route = createFileRoute("/guider/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Guider om cylindermontage – Cylinderhjälpen" },
      { name: "description", content: "Praktiska guider för låssmeder: så räknar du cylinderlängd, väljer ringar och förlängare, mäter dubbelcylinder och monterar iLOQ och rund cylinder." },
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
    <>
      <SitePageHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <PageHero eyebrow="Guider" icon={<BookOpen className="size-3.5" />} title="Guider om cylindermontage">Korta svar på vanliga frågor ute på jobbet.</PageHero>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {GUIDES.map((g, i) => (
            <li key={g.slug}>
              <Link to="/guider/$slug" params={{ slug: g.slug }} className={`group flex h-full flex-col p-5 ${cardLift}`}>
                <span className="text-xs font-bold tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-1 font-bold leading-snug">{g.title}</span>
                <span className="mt-1.5 flex-1 text-sm text-muted-foreground">{g.description}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">Läs guiden<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
