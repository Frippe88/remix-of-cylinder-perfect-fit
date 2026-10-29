import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { CalculatorPage } from "@/components/calculator-page";
import { AuthForm } from "@/components/auth-form";
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
  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden bg-primary bg-header text-primary-foreground">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-accent" />
        <div className="relative mx-auto flex max-w-5xl items-center gap-2.5 px-4 py-3 sm:py-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent sm:size-12">
            <KeyRound className="size-5 text-accent-foreground sm:size-6" aria-hidden />
          </span>
          <h1 className="text-base font-extrabold sm:text-2xl">Cylinderhjälpen Pro</h1>
        </div>
      </header>
      <main className="px-4 py-8">
        <AuthForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Vill du bara räkna en cylinder?{" "}
          <Link to="/" className="font-semibold text-accent hover:underline">Använd gratisversionen</Link>
        </p>
      </main>
    </div>
  );
}
