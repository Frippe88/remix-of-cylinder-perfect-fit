import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PageHero, SitePageHeader } from "@/components/site-page";
import { ContactContent } from "@/components/contact-form";

export const Route = createFileRoute("/kontakt")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Kontakta oss – Cylinderhjälpen" },
      { name: "description", content: "Skicka ett meddelande till Cylinderhjälpen om fel, saknade mått, faktura eller förbättringsförslag." },
      { property: "og:title", content: "Kontakta oss – Cylinderhjälpen" },
      { property: "og:description", content: "Hör av dig om fel, saknade mått, faktura eller förbättringsförslag." },
      { property: "og:url", content: "https://cylinderhjalpen.se/kontakt" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://cylinderhjalpen.se/kontakt" }],
  }),
  component: Kontakt,
});

function Kontakt() {
  return (
    <>
      <SitePageHeader />
      <main className="mx-auto w-full max-w-xl px-4 py-8 sm:py-12">
        <PageHero eyebrow="Kontakt" icon={<Mail className="size-3.5" />} title="Kontakta oss">Vi svarar vanligtvis inom 2 arbetsdagar.</PageHero>
        <div className="mt-6 rounded-2xl border border-l-4 border-l-accent bg-card p-5 shadow-card sm:p-6">
          <ContactContent />
        </div>
      </main>
    </>
  );
}
