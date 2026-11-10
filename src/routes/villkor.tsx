import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { PageHero, SitePageHeader } from "@/components/site-page";

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
  { h: "7. Personuppgifter", p: "Gratiskalkylatorn kräver inget konto. Skapar du ett Pro-konto sparar vi din e-postadress för inloggning, lösenordsåterställning och kvitton, samt de projekt och dörrar du själv sparar. Uppgifterna säljs aldrig och delas inte med andra än de tjänster som behövs för att driva sajten." },
  { h: "8. Betalning", p: "Betalningar hanteras krypterat av Stripe. Vi ser eller sparar aldrig ditt kortnummer – vi får bara besked om att abonnemanget är betalt." },
  { h: "9. Cookies och statistik", p: "Vi använder cookies och lokal lagring för att hålla dig inloggad och komma ihåg dina inställningar, samt Google Analytics för anonym besöksstatistik så vi kan förbättra sajten." },
  { h: "10. Dina rättigheter", p: "Du har rätt att få veta vilka uppgifter vi har om dig, få dem rättade eller raderade. Mejla oss så tar vi bort ditt konto och dina projekt." },
  { h: "11. Ändringar", p: "Villkoren kan uppdateras. Den senaste versionen finns alltid på denna sida." },
];

function Villkor() {
  return (
    <>
      <SitePageHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <PageHero eyebrow="Villkor & integritet" icon={<ShieldCheck className="size-3.5" />} title="Användarvillkor och integritet">Så får tjänsten användas och så hanterar vi dina uppgifter.</PageHero>
        <div className="mt-8 divide-y rounded-2xl border bg-card shadow-card">
          {sections.map((s) => {
            const [num, ...rest] = s.h.split(" ");
            return (
              <section key={s.h} className="flex gap-4 p-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold tabular-nums text-accent">{(num ?? "").replace(".", "")}</span>
                <div>
                  <h2 className="font-bold">{rest.join(" ")}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
                </div>
              </section>
            );
          })}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">Frågor? <Link to="/kontakt" className="font-semibold text-accent underline underline-offset-2">Skicka ett meddelande</Link></p>
      </main>
    </>
  );
}
