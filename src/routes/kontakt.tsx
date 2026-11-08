import { createFileRoute } from "@tanstack/react-router";
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
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold">Kontakta oss</h1>
      <div className="mt-4 rounded-xl border bg-card p-4 shadow-card sm:p-5">
        <ContactContent />
      </div>
    </main>
  );
}
