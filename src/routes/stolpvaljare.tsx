import { createFileRoute } from "@tanstack/react-router";
import { Check, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { AppTabs } from "@/components/app-tabs";
import { findStrikes, LENGTH_TOLERANCE_MM, type Brand, type Kind, type Profile } from "@/lib/strike";

export const Route = createFileRoute("/stolpvaljare")({
  head: () => ({
    meta: [
      { title: "Stolpväljare – rätt slutblecksstolpe för karmens urtag" },
      { name: "description", content: "Hitta vilken STEP- eller ASSA-stolpe som passar urtaget i dörrkarmen, för elslutbleck och mekaniska slutbleck." },
      { property: "og:title", content: "Stolpväljare" },
      { property: "og:description", content: "Välj rätt stolpe utifrån urtagets mått i karmen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Stolpvaljare,
});

const parse = (v: string) => {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};

function Seg<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid gap-1 rounded-lg bg-muted p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)} aria-pressed={value === o.id}
          className={`rounded-md px-2 py-2 text-sm font-semibold ${value === o.id ? "bg-card shadow-card" : "text-muted-foreground"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Stolpvaljare() {
  const [brands, setBrands] = useState<Brand[]>(["STEP", "ASSA"]);
  const [kind, setKind] = useState<Kind>("el");
  const [profile, setProfile] = useState<Profile | "alla">("alla");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");

  const len = parse(length);
  const matches = len == null ? null : findStrikes({ brands, kind, profile, length: len, width: parse(width) });

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Låssmedsverktyg</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Stolpväljare</h1>
          <p className="mt-2 max-w-xl text-sm opacity-80">Hitta stolpe som passar karmens befintliga urtag.</p>
          <AppTabs />
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[340px_1fr]">
        <section className="space-y-5 rounded-xl border bg-card p-4 shadow-card">
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wide">Typ av slutbleck</h2>
            <Seg options={[{ id: "el" as Kind, label: "Elslutbleck" }, { id: "mekanisk" as Kind, label: "Mekaniskt" }]} value={kind} onChange={setKind} />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wide">Fabrikat</h2>
            <div className="flex gap-2">
              {(["STEP", "ASSA"] as Brand[]).map((b) => {
                const on = brands.includes(b);
                return (
                  <button key={b} aria-pressed={on} onClick={() => setBrands(on ? brands.filter((x) => x !== b) : [...brands, b])}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold text-foreground ${on ? "border-success bg-success/10" : "border-input line-through"}`}>
                    {on ? <Check className="h-4 w-4 text-success" /> : <span className="h-4 w-4 rounded border border-input" />}
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wide">Stolptyp</h2>
            <Seg options={[{ id: "alla" as const, label: "Alla" }, { id: "plan" as const, label: "Plan" }, { id: "vinkel" as const, label: "Vinkel" }]} value={profile} onChange={setProfile} />
          </div>
          <MmInput label="Urtagets längd (höjd)" value={length} onChange={setLength} placeholder="t.ex. 215" />
          <MmInput label="Urtagets bredd (valfritt)" value={width} onChange={setWidth} placeholder="t.ex. 26" />
        </section>

        <section className="space-y-3">
          <div className="flex gap-2 rounded-lg border border-warning bg-warning/10 p-3 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <p><b>Testversion.</b> Stolptabellen är exempeldata och ännu inte kontrollerad mot STEP:s och ASSA:s kataloger. Kontrollera alltid artikeln innan beställning.</p>
          </div>
          {matches == null ? (
            <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Fyll i urtagets längd för att se stolpar som passar.</p>
          ) : matches.length === 0 ? (
            <p className="rounded-xl border bg-card p-6 text-sm">Ingen stolpe passar inom ±{LENGTH_TOLERANCE_MM} mm. Kontrollera måttet eller välj fler fabrikat/stolptyper.</p>
          ) : (
            matches.map((m, i) => (
              <div key={m.strike.id} className={`rounded-xl border bg-card p-4 shadow-card ${i === 0 ? "border-primary" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{m.strike.brand} · {m.strike.name}</p>
                  {i === 0 && <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">Bäst</span>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {m.strike.profile === "plan" ? "Planstolpe" : "Vinkelstolpe"} · urtag {m.strike.cutoutLength} × {m.strike.cutoutWidth} mm
                </p>
                <p className="mt-1 font-mono text-sm">
                  Längd {m.lengthDiff === 0 ? "exakt" : `${m.lengthDiff > 0 ? "+" : ""}${m.lengthDiff} mm`}
                  {m.widthDiff != null && ` · bredd ${m.widthDiff === 0 ? "exakt" : `${m.widthDiff > 0 ? "+" : ""}${m.widthDiff} mm`}`}
                </p>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

function MmInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-1 flex items-center rounded-lg border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
        <input inputMode="decimal" value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, "").slice(0, 6))}
          className="w-full bg-transparent px-3 py-3 font-mono text-xl font-bold outline-none" />
        <span className="pr-3 text-sm text-muted-foreground">mm</span>
      </div>
    </label>
  );
}
