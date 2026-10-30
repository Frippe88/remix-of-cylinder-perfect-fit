import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, ChevronRight, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { memberEmailSchema } from "@/lib/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Company = { id: string; name: string; admin_email: string; seats: number };
type Member = { id: string; email: string };

export function CompanySection({ email }: { email: string }) {
  const me = email.toLowerCase();
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const isAdmin = company?.admin_email.toLowerCase() === me;

  const load = useCallback(async () => {
    const { data } = await supabase.from("companies").select("id,name,admin_email,seats").limit(1).maybeSingle();
    setCompany(data);
    if (data && data.admin_email.toLowerCase() === me) {
      const { data: m } = await supabase.from("company_members").select("id,email").eq("company_id", data.id).order("created_at");
      setMembers(m ?? []);
    }
    setLoaded(true);
  }, [me]);
  useEffect(() => { void load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!company) return;
    const p = memberEmailSchema.safeParse(newEmail);
    if (!p.success) return setMsg("Ogiltig e-post.");
    const { error } = await supabase.from("company_members").insert({ company_id: company.id, email: p.data });
    if (error) return setMsg(/licens/i.test(error.message) ? "Alla licenser är använda." : /duplicate|unique/i.test(error.message) ? "Redan tillagd." : "Kunde inte lägga till.");
    setNewEmail(""); setMsg(null); void load();
  }
  async function remove(id: string) {
    await supabase.from("company_members").delete().eq("id", id);
    void load();
  }

  if (!loaded) return null;
  if (!company) return (
    <Link to="/foretag" className="flex items-center gap-2.5 rounded-lg border bg-card p-3 hover:bg-muted">
      <Building2 className="size-4 shrink-0 text-accent" aria-hidden />
      <span className="flex-1"><span className="block text-sm font-bold">Företagslicens för team</span><span className="block text-xs text-muted-foreground">Samlad faktura för alla tekniker</span></span>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
    </Link>
  );

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        <Building2 className="size-4 text-accent" aria-hidden />
        <p className="flex-1 truncate text-sm font-bold">{company.name}</p>
        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">{isAdmin ? "Admin" : "Pro aktivt"}</span>
      </div>
      {!isAdmin && <p className="mt-1 text-xs text-muted-foreground">Du tillhör {company.name} – Pro ingår via företaget.</p>}
      {isAdmin && (
        <div className="mt-2 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Mitt team · {members.length} av {company.seats} licenser</p>
          <ul className="space-y-1">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-sm">
                <span className="flex-1 truncate">{m.email}</span>
                <button type="button" onClick={() => remove(m.id)} aria-label={`Ta bort ${m.email}`} className="text-destructive hover:opacity-80"><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
          <form onSubmit={add} className="flex gap-2">
            <Input type="email" placeholder="tekniker@foretag.se" autoComplete="off" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-10" />
            <Button type="submit" className="h-10 bg-accent px-3 text-accent-foreground hover:bg-accent/90" aria-label="Lägg till tekniker"><UserPlus className="size-4" /></Button>
          </form>
          {msg && <p className="text-xs font-medium text-destructive">{msg}</p>}
          <p className="text-[11px] text-muted-foreground">Teknikern loggar in med samma e-post för att få Pro.</p>
        </div>
      )}
    </div>
  );
}
