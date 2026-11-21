import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

export const HOME_FAQ = [
  {
    q: "Hur monterar man en cylinder på ytterdörr?",
    a: "Mät dörrdjupet från låshusets cylinderfäste ut till dörrens yta, med skylt eller förstärkningsbehör på. Skriv in måttet i kalkylatorn så får du rätt förlängare och ring. Montera cylindern med förlängarna, lägg ringen utanpå och dra fast med rätt skruvlängd.",
  },
  {
    q: "Hur mäter jag cylinderlängd på dörren?",
    a: "Mät inte hela dörrens tjocklek. Mät från låshusets cylinderfäste ut till dörrbladets yta på den sida du räknar. Vid dubbelcylinder mäter du utsida och insida var för sig, eftersom måtten ofta skiljer sig.",
  },
  {
    q: "Hur mycket får en cylinder sticka ut?",
    a: "För oval cylinder och iLOQ är godkänd avvikelse −2 till +2 mm enligt regelboken. En cylinder som sticker ut mer är lättare att angripa. För rund cylinder finns ingen fast regel, men målet är så nära dörrens yta som möjligt.",
  },
  {
    q: "Vilka cylinderförlängare och ringar behövs?",
    a: "Det beror på dörrdjupet. En standard oval cylinder är 31 mm. Förlängarna bygger upp det stora måttet och ringen finjusterar resten. Kalkylatorn räknar fram kombinationen med minst utstick och färst delar.",
  },
  {
    q: "Fungerar det för oval, rund och iLOQ-cylinder?",
    a: "Ja. Kalkylatorn hanterar oval cylinder, rund cylinder (ASSA ABLOY, dormakaba, EVVA) och iLOQ, både enkel- och dubbelcylinder.",
  },
];

export function HomeSeoSection() {
  return (
    <section className="mx-auto mt-10 w-full max-w-5xl px-4">
      <div className="rounded-xl border bg-card p-5 shadow-card sm:p-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Montera cylinder på ytterdörr – rätt mått direkt</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>När du byter eller monterar låscylinder på en ytterdörr är det dörrdjupet som avgör vilka cylinderförlängare och vilken cylinderring som behövs. Cylinderhjälpen räknar ut det åt dig på några sekunder.</p>
          <p>Mät från låshusets cylinderfäste ut till dörrens yta, välj cylindertyp och skriv in måttet. Du får rätt förlängare, ring och skruvlängd, så att cylindern varken sticker ut för mycket eller sitter för djupt.</p>
        </div>
        <h3 className="mt-6 text-lg font-bold">Vanliga frågor</h3>
        <div className="mt-3 divide-y rounded-lg border">
          {HOME_FAQ.map((f) => (
            <details key={f.q} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
                {f.q}
                <ChevronDown className="size-4 shrink-0 text-accent transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Vill du läsa mer? <Link to="/guider" className="font-semibold text-foreground underline underline-offset-2">Se alla guider</Link>.</p>
      </div>
    </section>
  );
}
