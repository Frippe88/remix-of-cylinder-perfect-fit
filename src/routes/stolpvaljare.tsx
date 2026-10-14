import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { AppTabs } from "@/components/app-tabs";
import {
  WOOD_COLUMNS,
  existingOptions,
  findByExisting,
  findByProfile,
  PROFILES,
  type WoodColumnId,
} from "@/lib/strike";

export const Route = createFileRoute("/stolpvaljare")({
  head: () => ({
    meta: [
      { title: "Stolpväljare – rätt montagestolpe för karmens urtag" },
      { name: "description", content: "Hitta vilken STEP-montagestolpe som passar urtaget efter befintligt slutbleck eller elslutbleck, eller i alu-/stålprofil." },
      { property: "og:title", content: "Stolpväljare" },
      { property: "og:description", content: "Välj rätt STEP-stolpe utifrån vad som sitter i karmen i dag." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Stolpvaljare,
});

const label = (id: WoodColumnId) => WOOD_COLUMNS.find((c) => c.id === id)!.label;
const selectCls = "mt-1 w-full rounded-lg border border-input bg-card px-3 py-3 text-base font-semibold outline-none focus:ring-2 focus:ring-ring";

function Stolpvaljare() {
  const [mode, setMode] = useState<"karm" | "profil">("karm");
  const [existing, setExisting] = useState("");
  const [target, setTarget] = useState<WoodColumnId>("step40");
  const [profile, setProfile] = useState("");

  const options = useMemo(() => existingOptions(), []);
  const groups = WOOD_COLUMNS.map((c) => ({ ...c, items: options.filter((o) => o.column === c.id) })).filter((g) => g.items.length);
  const results = existing ? findByExisting(existing, target) : null;
  const profileResults = profile ? findByProfile(profile) : null;

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Låssmedsverktyg</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Stolpväljare</h1>
          <p className="mt-2 max-w-xl text-sm opacity-80">Hitta STEP-stolpe som passar karmens befintliga urtag.</p>
          <AppTabs />
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <section className="space-y-5 rounded-xl border bg-card p-4 shadow-card">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {([["karm", "Trä-/stålkarm"], ["profil", "Alu-/stålprofil"]] as const).map(([id, l]) => (
              <button key={id} onClick={() => setMode(id)} aria-pressed={mode === id}
                className={`rounded-md px-2 py-2 text-sm font-semibold ${mode === id ? "bg-card shadow-card" : "text-muted-foreground"}`}>{l}</button>
            ))}
          </div>

          {mode === "karm" ? (
            <>
              <label className="block">
                <span className="text-sm font-semibold">1. Vad sitter i karmen i dag?</span>
                <span className="block text-xs text-muted-foreground">Slutblecket eller elslutblecket vars urtag du vill återanvända.</span>
                <select className={selectCls} value={existing} onChange={(e) => setExisting(e.target.value)}>
                  <option value="">Välj befintlig produkt…</option>
                  {groups.map((g) => (
                    <optgroup key={g.id} label={g.label}>
                      {g.items.map((o) => (
                        <option key={o.value} value={o.value}>{o.article}{o.angled ? " (vinkel i framkant)" : ""}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">2. Vilket elslutbleck ska monteras?</span>
                <select className={selectCls} value={target} onChange={(e) => setTarget(e.target.value as WoodColumnId)}>
                  {WOOD_COLUMNS.filter((c) => c.target).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </label>
            </>
          ) : (
            <label className="block">
              <span className="text-sm font-semibold">Vilken profil sitter dörren i?</span>
              <select className={selectCls} value={profile} onChange={(e) => setProfile(e.target.value)}>
                <option value="">Välj profil…</option>
                {PROFILES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          )}
        </section>

        <section className="space-y-3">
          {mode === "karm" ? (
            results == null ? (
              <Empty>Välj vad som sitter i karmen i dag för att se vilken stolpe som passar.</Empty>
            ) : results.length === 0 ? (
              <Empty>Guiden har ingen stolpe för <b>{label(target)}</b> i det här urtaget. Prova ett annat elslutbleck eller kontakta STEP för kundanpassad stolpe.</Empty>
            ) : (
              results.map((r) => (
                <div key={r.target} className="rounded-xl border border-primary bg-card p-4 shadow-card">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Montagestolpe för {label(target)}</p>
                  <p className="mt-1 font-mono text-3xl font-extrabold">{r.target}</p>
                  {r.angled && <p className="mt-1 text-sm">Motsvarar mekaniskt slutbleck med vinkel i framkant.</p>}
                  {r.target.startsWith("ST6504") && <p className="mt-1 text-sm">Vid ersättning av 730 ska ST6504V/H (vänster/höger) användas.</p>}
                  {r.equivalents.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-xs font-semibold text-muted-foreground">Passar samma urtag</p>
                      <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
                        {r.equivalents.map((e) => (
                          <li key={e.column + e.article}><span className="font-mono font-bold">{e.article}</span> <span className="text-muted-foreground">· {label(e.column)}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )
          ) : profileResults == null ? (
            <Empty>Välj profil för att se stolpar per elslutbleck.</Empty>
          ) : (
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <p className="font-bold">{profile}</p>
              <ul className="mt-2 divide-y">
                {profileResults.map((r) => (
                  <li key={r.column} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="text-muted-foreground">{r.column}</span>
                    <span className="font-mono font-bold">{r.article}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" />
            <p>Källa: StepLock Stolpguide 2019, utgåva 1 – ett urval av STEP:s sortiment. Kontrollera alltid att urtaget stämmer med stolpens måttskiss innan montage.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">{children}</p>;
}
