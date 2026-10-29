import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { CalculatorPage } from "@/components/calculator-page";
import { ProLoginBar } from "@/components/pro-login-bar";
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
  if (loading) return <div className="min-h-screen" />;
  if (user) return <CalculatorPage variant="pro" />;
  // Utan inloggning: hela gratis-kalkylatorn först, inloggning som liten remsa.
  return <CalculatorPage variant="free" loginBar={<ProLoginBar />} navActive="pro" />;
}
