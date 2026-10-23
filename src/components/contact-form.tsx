import { Mail } from "lucide-react";

export const CONTACT_EMAIL = "cylinderkalkyl@gmail.com";

export function ContactForm() {
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Fråga om Cylinderhjälpen")}`;
  return (
    <section className="mx-auto mt-6 max-w-5xl px-4 pb-10">
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Mail className="size-5" aria-hidden /> Kontakta oss</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Hittar du något som inte stämmer, saknar du ett mått eller har du ett förbättringsförslag? Hör gärna av dig – Cylinderhjälpen utvecklas tillsammans med dem som använder den i dagligt arbete.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
            Mejla till <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-link underline underline-offset-2">{CONTACT_EMAIL}</a>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
            Vi svarar vanligtvis inom 2 arbetsdagar
          </li>
        </ul>
        <a href={href} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Mail className="size-4" aria-hidden /> Mejla oss
        </a>
      </div>
    </section>
  );
}
