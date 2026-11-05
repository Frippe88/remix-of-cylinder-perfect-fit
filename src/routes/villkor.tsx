import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACT_EMAIL } from "@/components/contact-form";

export const Route = createFileRoute("/villkor")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Användarvillkor – Cylinderhjälpen" },
      { name: "description", content: "Användarvillkor och upphovsrätt för Cylinderhjälpen, cylinderkalkylatorn för låssmeder." },
      { property: "og:title", content: "Användarvillkor – Cylinderhjälpen" },
      { property: "og:description", content: "Villkor för användning av Cylinderhjälpen och Cylinderhjälpen Pro." },
      { property: "og:url", content: "https://cylinderhjalpen.se/villkor" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://cylinderhjalpen.se/villkor" }],
  }),
  component: Villkor,
});

const sections: { h: string; p: string }[] = [
  { h: "1. Om tjänsten", p: "Cylinderhjälpen är ett hjälpmedel för att räkna fram cylinder, ringar, förlängare och skruv. Gratisversionen är öppen för alla. Cylinderhjälpen Pro kräver konto och abonnemang." },
  { h: "2. Upphovsrätt", p: "All kod, beräkningslogik, text, design, guider och grafik på cylinderhjalpen.se tillhör Cylinderhjälpen och skyddas av upphovsrättslagen. Det är inte tillåtet att kopiera, återskapa, sälja vidare eller bygga konkurrerande tjänster på innehållet eller beräkningarna utan skriftligt tillstånd." },
  { h: "3. Tillåten användning", p: "Du får använda tjänsten i ditt arbete och dela utskrifter och PDF:er med kunder och kollegor. Det är inte tillåtet att automatiskt hämta data, försöka kringgå inloggning eller betalning, eller dela ett Pro-konto mellan flera personer." },
  { h: "4. Ansvar", p: "Beräkningarna bygger på tillverkarnas mått och branschpraxis. Kontrollera alltid mått och montage på plats. Cylinderhjälpen ansvarar inte för felaktiga beställningar, montage eller följdskador." },
  { h: "5. Varumärken", p: "ASSA ABLOY, iLOQ, dormakaba, EVVA och andra fabrikat är varumärken som tillhör respektive ägare. Cylinderhjälpen är inte knuten till dessa företag." },
  { h: "6. Abonnemang", p: "Pro betalas per månad eller år, utan bindningstid. Uppsägning gäller från nästa betalperiod." },
  { h: "7. Ändringar", p: "Villkoren kan uppdateras. Den senaste versionen finns alltid på denna sida." },
];

function Villkor() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/" className="text-sm text-accent">← Till kalkylatorn</Link>
      <h1 className="mt-4 text-2xl font-bold">Användarvillkor</h1>
      <div className="mt-6 space-y-5">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-semibold">{s.h}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">Frågor? Mejla till <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-link underline underline-offset-2">{CONTACT_EMAIL}</a></p>
    </main>
  );
}
