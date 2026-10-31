import { PRO_MONTHLY_SEK } from "@/lib/subscription";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { CalculatorPage } from "@/components/calculator-page";
import { ProLoginBar } from "@/components/pro-login-bar";
import { ProDialog } from "@/components/pro-dialog";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/pro")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Cylinderhjälpen Pro – projekt, behör och plocklista" },
      { name: "description", content: "Cylinderkalkylator med projekt, flera dörrar, total plocklista och PDF-export för låssmeder." },
      { property: "og:title", content: "Cylinderhjälpen Pro – projekt, behör och plocklista" },
      { property: "og:description", content: "Spara dörrar i projekt, få total plocklista och exportera PDF." },
      { property: "og:url", content: "https://cylinderhjalpen.se/pro" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://cylinderhjalpen.se/pro" }],
  }),
  component: ProRoute,
});

function ProRoute() {
  const { user, loading } = useAuth();
  const [proOpen, setProOpen] = useState(true);
  if (loading) return <div className="min-h-screen" />;
  if (user) return <CalculatorPage variant="pro" loginBar={<ProAccountBar userId={user.id} />} />;
  // Utan inloggning: hela gratis-kalkylatorn först, inloggning som liten remsa
  // och infopopopen med vad Pro innehåller öppen direkt.
  return (
    <>
      <CalculatorPage variant="free" loginBar={<ProLoginBar />} navActive="pro" locked />
      <ProDialog open={proOpen} onOpenChange={setProOpen} />
    </>
  );
}

function ProAccountBar({ userId }: { userId: string }) {
  const { active, loading } = useSubscription(userId);
  if (loading) return null;
  return (
    <Link to="/konto" className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/5 px-3 py-2 text-sm shadow-card hover:bg-accent/10">
      <Star className="size-4 shrink-0 text-accent" aria-hidden />
      <span className="flex-1">{active ? <><b>Pro aktivt</b> – abonnemang och kvitton</> : <><b>Beta:</b> köp Pro för {PRO_MONTHLY_SEK} kr/mån</>}</span>
      <span className="font-bold text-accent">Mitt konto →</span>
    </Link>
  );
}
