import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listProUsers, type ProUser } from "@/lib/admin.functions";
import { sendCompanyWelcome } from "@/lib/company-invite.functions";
import type { Database } from "@/integrations/supabase/types";

type Company = Database["public"]["Tables"]["companies"]["Row"];
type Member = Database["public"]["Tables"]["company_members"]["Row"];

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Admin – Cylinderhjälpen" },
      { name: "description", content: "Hantera företag och Pro-kunder." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin – Cylinderhjälpen" },
      { property: "og:description", content: "Hantera företag och Pro-kunder." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("sv-SE") : "–");

function AdminPage() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [pros, setPros] = useState<ProUser[]>([]);
  const [form, setForm] = useState({ name: "", email: "", seats: "5" });
  const fetchPros = useServerFn(listProUsers);
  const sendWelcome = useServerFn(sendCompanyWelcome);

  const load = useCallback(async () => {
    const [c, m] = await Promise.all([
      supabase.from("companies").select("*").order("created_at", { ascending: false }),
      supabase.from("company_members").select("*").order("created_at"),
    ]);
    setCompanies(c.data ?? []);
    setMembers(m.data ?? []);
    fetchPros().then(setPros).catch(() => setPros([]));
  }, [fetchPros]);

  useEffect(() => {
    if (!user) return;
    void supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
      if (data) void load();
    });
  }, [user, load]);

  async function addCompany(e: React.FormEvent) {
    e.preventDefault();
    const seats = Math.max(1, Math.min(500, parseInt(form.seats) || 1));
    const email = form.email.trim().toLowerCase();
    if (!form.name.trim() || !email.includes("@")) return alert("Fyll i namn och e-post.");
    const { data: created, error } = await supabase.from("companies").insert({ name: form.name.trim(), admin_email: email, seats, plan: "manual" }).select("id").single();
    if (error || !created) return alert("Kunde inte skapa företaget.");
    setForm({ name: "", email: "", seats: "5" });
    sendWelcome({ data: { companyId: created.id } })
      .then((r) => alert(r.sent ? `Företaget skapat. Välkomstmejl skickat till ${email}.` : "Företaget skapat, men mejlet kunde inte skickas."))
      .catch(() => alert("Företaget skapat, men mejlet kunde inte skickas."));
    void load();
  }
  async function removeCompany(c: Company) {
    if (!confirm(`Ta bort ${c.name}? Alla anställda förlorar Pro direkt.`)) return;
    const { error } = await supabase.from("companies").delete().eq("id", c.id);
    if (error) return alert("Kunde inte ta bort företaget.");
    void load();
  }

  if (loading) return <div className="min-h-screen" />;
  if (!user || isAdmin === false) return <p className="p-6 text-center">Ingen behörighet. <Link to="/pro" className="font-bold text-accent">Logga in</Link></p>;
  if (isAdmin === null) return <div className="min-h-screen" />;

  const active = companies.filter((c) => c.status === "active");
  const ended = companies.filter((c) => c.status !== "active");

  const renderCompany = (c: Company) => {
    const m = members.filter((x) => x.company_id === c.id);
    const manual = !c.stripe_subscription_id;
    return (
      <li key={c.id} className="rounded-lg border bg-card text-sm">
        <details>
          <summary className="flex cursor-pointer list-none items-center gap-2 p-3">
            <span className="flex-1"><b>{c.name}</b> · {m.length} av {c.seats} licenser</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold">{manual ? "Manuell" : "Betald"}</span>
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
          </summary>
          <div className="space-y-2 border-t p-3">
            <p>Admin: <a href={`mailto:${c.admin_email}`} className="font-semibold text-accent">{c.admin_email}</a></p>
            {c.org_number && <p className="text-muted-foreground">Org.nr {c.org_number}</p>}
            <p className="text-muted-foreground">Skapad {fmt(c.created_at)}</p>
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
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <Link to="/pro" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"><ArrowLeft className="size-4" />Tillbaka</Link>
      <h1 className="text-2xl font-extrabold">Admin</h1>
      <p className="text-sm text-muted-foreground">Köp, uppsägningar och utgångna perioder sköts automatiskt. Här kan du även lägga till eller ta bort företag manuellt.</p>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">Aktiva företag ({active.length})</h2>
        <ul className="space-y-2">
          {active.length === 0 && <li className="text-muted-foreground">Inga aktiva företag.</li>}
          {active.map(renderCompany)}
        </ul>
      </section>

      <form onSubmit={addCompany} className="space-y-2 rounded-xl border bg-card p-4 shadow-card">
        <h2 className="text-lg font-bold">Lägg till företag manuellt</h2>
        <p className="text-sm text-muted-foreground">Gratis licens utan betalning, t.ex. för test eller samarbete.</p>
        <Input placeholder="Företagsnamn" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input type="email" placeholder="Admins e-post" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input type="number" min={1} max={500} placeholder="Antal licenser" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} />
        <Button type="submit" className="bg-accent font-bold text-accent-foreground hover:bg-accent/90">Lägg till</Button>
      </form>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">Enskilda Pro ({pros.filter((p) => p.active).length} aktiva)</h2>
        <ul className="space-y-1 text-sm">
          {pros.length === 0 && <li className="text-muted-foreground">Inga enskilda kunder än.</li>}
          {pros.map((p, i) => (
            <li key={i} className={`flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3 ${p.active ? "" : "opacity-60"}`}>
              <span className="flex-1 font-semibold">{p.email}</span>
              <span className="text-muted-foreground">
                {p.active ? (p.cancelAtEnd ? `Uppsagd, slutar ${fmt(p.periodEnd)}` : `Förnyas ${fmt(p.periodEnd)}`) : `Avslutad ${fmt(p.periodEnd)}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {ended.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-muted-foreground">Avslutade företag ({ended.length})</h2>
          <ul className="space-y-2 opacity-70">{ended.map(renderCompany)}</ul>
        </section>
      )}
    </main>
  );
}
