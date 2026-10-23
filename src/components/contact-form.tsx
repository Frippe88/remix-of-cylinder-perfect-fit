import { Mail } from "lucide-react";

export const CONTACT_EMAIL = "cylinderkalkyl@gmail.com";

export function ContactForm() {
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Fråga om Cylinderhjälpen")}`;
  return (
    <section className="mx-auto mt-6 max-w-5xl px-4 pb-10">
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Mail className="size-5" aria-hidden /> Kontakta oss</h2>
        <p className="mt-1 text-xs text-muted-foreground">Tips, fel eller önskemål? Maila oss på {CONTACT_EMAIL}</p>
        <p className="mt-1 text-xs text-muted-foreground">Vi svarar inom 2 arbetsdagar.</p>
        <a href={href} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Mail className="size-4" aria-hidden /> Maila oss
        </a>
      </div>
    </section>
  );
}
