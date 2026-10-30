import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type App = Database["public"]["Tables"]["company_applications"]["Row"];
type Company = Database["public"]["Tables"]["companies"]["Row"];
type Member = Database["public"]["Tables"]["company_members"]["Row"];

function AppDetails({ a }: { a: App }) {
  return (
    <>
      <p className="text-sm">{a.contact_name} · <a href={`tel:${a.phone}`} className="font-semibold text-accent">{a.phone}</a> · <a href={`mailto:${a.email}`} className="font-semibold text-accent">{a.email}</a></p>
      <p className="text-sm text-muted-foreground">{a.seats} tekniker{a.org_number ? ` · Org.nr ${a.org_number}` : ""} · Ansökte {new Date(a.created_at).toLocaleDateString("sv-SE")}</p>
      {a.message && <p className="mt-1 text-sm">{a.message}</p>}
    </>
  );
}

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Admin – Cylinderhjälpen" },
      { name: "description", content: "Hantera företagsansökningar." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin – Cylinderhjälpen" },
      { property: "og:description", content: "Hantera företagsansökningar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const load = useCallback(async () => {
    const [a, c, m] = await Promise.all([
      supabase.from("company_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("companies").select("*").order("created_at", { ascending: false }),
      supabase.from("company_members").select("*").order("created_at"),
    ]);
    setApps(a.data ?? []);
    setCompanies(c.data ?? []);
    setMembers(m.data ?? []);
  }, []);

  useEffect(() => {
    if (!user) return;
    void supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
      if (data) void load();
    });
  }, [user, load]);

  async function approve(a: App) {
    const { error } = await supabase.from("companies").insert({ name: a.company_name, admin_email: a.email.toLowerCase(), seats: a.seats });
    if (error) return alert("Kunde inte skapa företaget.");
    await supabase.from("company_applications").update({ status: "approved" }).eq("id", a.id);
    void load();
  }
  async function removeCompany(c: Company) {
    if (!confirm(`Ta bort ${c.name}? Alla anställda förlorar Pro direkt.`)) return;
    const { error } = await supabase.from("companies").delete().eq("id", c.id);
    if (error) return alert("Kunde inte ta bort företaget.");
    void load();
  }
  async function removeApp(a: App) {
    if (!confirm(`Ta bort ansökan från ${a.company_name}?`)) return;
    const { error } = await supabase.from("company_applications").delete().eq("id", a.id);
    if (error) return alert("Kunde inte ta bort ansökan.");
    void load();
  }
  async function reject(a: App) {
    await supabase.from("company_applications").update({ status: "rejected" }).eq("id", a.id);
    void load();
  }

  const openApps = apps.filter((a) => a.status !== "approved");

  if (loading) return <div className="min-h-screen" />;
  if (!user || isAdmin === false) return <p className="p-6 text-center">Ingen behörighet. <Link to="/pro" className="font-bold text-accent">Logga in</Link></p>;
  if (isAdmin === null) return <div className="min-h-screen" />;

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <Link to="/pro" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="size-4" />Tillbaka</Link>
      <h1 className="text-2xl font-extrabold">Företagsansökningar</h1>
      <ul className="space-y-3">
        {openApps.length === 0 && <li className="text-muted-foreground">Inga nya ansökningar.</li>}
        {openApps.map((a) => (
          <li key={a.id} className="rounded-xl border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex-1 text-lg font-bold">{a.company_name}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${a.status === "pending" ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"}`}>
                {a.status === "pending" ? "Väntar" : "Nekad"}
              </span>
            </div>
            <AppDetails a={a} />
            <div className="mt-3 flex flex-wrap gap-2">
              {a.status === "pending" && (
                <>
                  <Button onClick={() => approve(a)} className="bg-accent font-bold text-accent-foreground hover:bg-accent/90">Godkänn</Button>
                  <Button variant="outline" onClick={() => reject(a)}>Neka</Button>
                </>
              )}
              <Button variant="ghost" className="text-destructive" onClick={() => removeApp(a)}>Ta bort ansökan</Button>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-bold">Aktiva företag</h2>
      <ul className="space-y-2">
        {companies.length === 0 && <li className="text-muted-foreground">Inga aktiva företag.</li>}
        {companies.map((c) => {
          const app = apps.find((a) => a.status === "approved" && a.email.toLowerCase() === c.admin_email.toLowerCase() && a.company_name === c.name);
          const m = members.filter((x) => x.company_id === c.id);
          return (
            <li key={c.id} className="rounded-lg border bg-card text-sm">
              <details>
                <summary className="flex cursor-pointer list-none items-center gap-2 p-3">
                  <span className="flex-1"><b>{c.name}</b> · {m.length} av {c.seats} licenser</span>
                  <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
                </summary>
                <div className="space-y-2 border-t p-3">
                  <p>Admin: <a href={`mailto:${c.admin_email}`} className="font-semibold text-accent">{c.admin_email}</a></p>
                  {app && <AppDetails a={app} />}
                  <p className="text-muted-foreground">Aktivt sedan {new Date(c.created_at).toLocaleDateString("sv-SE")}</p>
                  <div>
                    <p className="font-semibold">Tekniker</p>
                    {m.length === 0 ? <p className="text-muted-foreground">Inga tillagda än.</p> : (
                      <ul className="mt-1 space-y-1">{m.map((x) => <li key={x.id} className="rounded-md bg-muted px-2 py-1">{x.email}</li>)}</ul>
                    )}
                  </div>
                  <Button size="sm" variant="destructive" onClick={() => removeCompany(c)}>Ta bort företag</Button>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
