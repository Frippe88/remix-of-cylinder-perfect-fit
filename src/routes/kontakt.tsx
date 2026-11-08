import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
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
      <Link to="/" className="text-sm text-accent">← Till kalkylatorn</Link>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-card dark:bg-accent dark:text-accent-foreground">
          <Mail className="size-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Kontakta oss</h1>
          <p className="text-sm text-muted-foreground">Vi svarar vanligtvis inom 2 arbetsdagar.</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-l-4 border-l-accent bg-card p-4 shadow-card sm:p-5">
        <ContactContent />
      </div>
    </main>
  );
}
