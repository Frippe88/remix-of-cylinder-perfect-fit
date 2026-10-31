import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Check } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { AuthForm } from "@/components/auth-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { joinCompanyByLink } from "@/lib/company-invite.functions";

export const Route = createFileRoute("/inbjudan/$id")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Inbjudan till Cylinderhjälpen Pro" },
      { name: "description", content: "Ditt företag har bjudit in dig till Cylinderhjälpen Pro." },
      { property: "og:title", content: "Inbjudan till Cylinderhjälpen Pro" },
      { property: "og:description", content: "Logga in eller skapa konto så låses Pro upp via företaget." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InvitePage,
});

const REASONS: Record<string, string> = {
  invalid: "Länken gäller inte längre. Be din chef om en ny.",
  full: "Alla licenser i företaget är använda. Be din chef lägga till fler.",
  no_email: "Ditt konto saknar e-post.",
  error: "Något gick fel. Försök igen.",
};

function InvitePage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const join = useServerFn(joinCompanyByLink);
  const [res, setRes] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!user || res) return;
    join({ data: { token: id } })
      .then((r) => setRes(r.ok ? { ok: true, text: r.already ? `Du är redan med i ${r.companyName} – Pro är aktivt.` : `Klart! Du har nu Pro via ${r.companyName}.` } : { ok: false, text: REASONS[r.reason] ?? REASONS["error"]! }))
      .catch(() => setRes({ ok: false, text: REASONS["error"]! }));
  }, [user, id, join, res]);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-4">
      <div className="flex items-center gap-2">
        <Building2 className="size-5 text-accent" aria-hidden />
        <h1 className="text-lg font-bold">Inbjudan till Cylinderhjälpen Pro</h1>
      </div>
      {loading ? null : !user ? (
        <>
          <p className="text-sm text-muted-foreground">Ditt företag har bjudit in dig. Logga in eller skapa ett konto så låses Pro upp direkt.</p>
          <div className="rounded-xl border bg-card"><AuthForm initialMode="up" /></div>
        </>
      ) : !res ? (
        <p className="text-sm text-muted-foreground">Kopplar ditt konto…</p>
      ) : (
        <>
          <p className={`flex items-start gap-2 text-sm font-semibold ${res.ok ? "text-success" : "text-destructive"}`}>
            {res.ok && <Check className="mt-0.5 size-4 shrink-0" aria-hidden />}{res.text}
          </p>
          {res.ok && <Button asChild className="bg-accent font-bold text-accent-foreground hover:bg-accent/90"><Link to="/pro">Öppna Pro</Link></Button>}
        </>
      )}
    </main>
  );
}
