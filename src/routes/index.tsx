import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useMemo, useState } from "react";
import {
  calculate,
  filterByMode,
  describeDeviation,
  formatMm,
  formatSigned,
  EXTENDER_SIZES,
  RING_HEIGHTS,
  ILOQ_RING_HEIGHTS,
  STANDARD_CYLINDER_MM,
  ILOQ_CYLINDER_MM,
  type Combination,
  type ViewMode,
} from "@/lib/cylinder";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cylinderkalkylator – förlängare och ringar för låssmeder" },
      { name: "description", content: "Räkna fram rätt kombination av cylinderförlängare och cylinderringar, för enkel- och dubbelcylinder." },
      { property: "og:title", content: "Cylinderkalkylator" },
      { property: "og:description", content: "Exakt beräkning av cylinderförlängare och ringar för låssmeder." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const parse = (v: string) => {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const CYLINDER_OPTIONS = [
  {
    id: "standard" as const,
    name: "Oval cylinder",
    mm: STANDARD_CYLINDER_MM,
    hint: "Vanlig nyckelcylinder med oval profil, kallas också euro- eller systemcylinder. Öppnas med en nyckel med tandat blad.",
  },
  {
    id: "iloq" as const,
    name: "iLOQ-cylinder",
    mm: ILOQ_CYLINDER_MM,
    hint: "Elektronisk cylinder utan vanligt nyckelhål.",
  },
];



function Index() {
  const [type, setType] = useState<"single" | "double">("single");
  const [cyl, setCyl] = useState<"standard" | "iloq">("standard");
  const [outside, setOutside] = useState("");
  const [inside, setInside] = useState("");
  const [ext, setExt] = useState<number[]>([...EXTENDER_SIZES]);
  const [rings, setRings] = useState<number[]>([...RING_HEIGHTS]);

  const baseMm = cyl === "iloq" ? ILOQ_CYLINDER_MM : STANDARD_CYLINDER_MM;
  const ringValues = cyl === "iloq" ? [...RING_HEIGHTS, ...ILOQ_RING_HEIGHTS] : [...RING_HEIGHTS];

  const toggle = (list: number[], set: (v: number[]) => void, v: number) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const switchCyl = (c: "standard" | "iloq") => {
    setCyl(c);
    if (c === "standard") setRings((r) => r.filter((v) => !(ILOQ_RING_HEIGHTS as readonly number[]).includes(v)));
    else setRings((r) => [...new Set([...r, ...ILOQ_RING_HEIGHTS])]);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Låssmedsverktyg</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Cylinderkalkylator</h1>
          <p className="mt-2 max-w-xl text-sm opacity-80">
            Godkänd avvikelse −1 till +2 mm.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[340px_1fr]">
        <section className="space-y-5">
          <Panel title="Mätning">
            <p className="text-xs text-muted-foreground">
              Välj den cylinder du ska sätta in. iLOQ gäller bara om cylindern eller låset är märkt iLOQ – annars är det den ovala.
            </p>
            <div className="space-y-2">
              {CYLINDER_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => switchCyl(o.id)}
                  aria-pressed={cyl === o.id}
                  className={`w-full rounded-lg border p-3 text-left transition ${cyl === o.id ? "border-primary bg-primary/5 shadow-card" : "border-input bg-card hover:bg-muted"}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold">{o.name}</span>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-xs font-bold ${cyl === o.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {o.mm} mm
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-muted-foreground">{o.hint}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["single", "double"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-md py-2 text-sm font-semibold transition ${type === t ? "bg-card shadow-card" : "text-muted-foreground"}`}
                >
                  {t === "single" ? "Enkelcylinder" : "Dubbelcylinder"}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {type === "single" ? "Cylinder på utsida eller insida." : "Cylinder på både utsida och insida."}
            </p>
            <DepthInput label={type === "single" ? "Dörrdjup" : "Dörrdjup utsida"} value={outside} onChange={setOutside} />
            {type === "double" && <DepthInput label="Dörrdjup insida" value={inside} onChange={setInside} />}
            <p className="text-xs text-foreground">Avstånd från låshusets referenspunkt till dörrbladets yta.</p>
          </Panel>

          <Panel title="Förlängare i lager">
            <ChipGroup values={[...EXTENDER_SIZES]} selected={ext} onToggle={(v) => toggle(ext, setExt, v)} />
          </Panel>
          <Panel title="Ringhöjder i lager">
            <ChipGroup values={ringValues} selected={rings} onToggle={(v) => toggle(rings, setRings, v)} />
          </Panel>
        </section>

        <section className="space-y-8">
          <Side title={type === "single" ? null : "Utsida"} depth={parse(outside)} ext={ext} rings={rings} baseMm={baseMm} />
          {type === "double" && <Side title="Insida" depth={parse(inside)} ext={ext} rings={rings} baseMm={baseMm} />}
        </section>
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-card">
      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function DepthInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-1 flex items-center rounded-lg border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, "").slice(0, 6))}
          placeholder="t.ex. 36"
          className="w-full bg-transparent px-3 py-3 font-mono text-xl font-bold outline-none"
        />
        <span className="pr-3 text-sm text-muted-foreground">mm</span>
      </div>
    </label>
  );
}

function ChipGroup({ values, selected, onToggle }: { values: number[]; selected: number[]; onToggle: (v: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((v) => {
        const on = selected.includes(v);
        return (
          <label
            key={v}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 font-mono text-sm font-bold text-foreground transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${on ? "border-success bg-success-soft" : "border-input bg-card line-through"}`}
          >
            <input type="checkbox" checked={on} onChange={() => onToggle(v)} className="sr-only" />
            {on ? (
              <Check className="h-4 w-4 shrink-0 text-success" strokeWidth={3} aria-hidden />
            ) : (
              <span className="h-4 w-4 shrink-0 rounded border-2 border-foreground/30" aria-hidden />
            )}
            {formatMm(v)}
          </label>
        );
      })}
    </div>
  );
}

const MODES: { id: ViewMode; label: string }[] = [
  { id: "exact", label: "Exakt 0 mm" },
  { id: "all", label: "Alla godkända" },
  { id: "fewer", label: "Färre förlängare" },
];

function Side({ title, depth, ext, rings, baseMm }: { title: string | null; depth: number | null; ext: number[]; rings: number[]; baseMm: number }) {
  const [mode, setMode] = useState<ViewMode>("all");
  const results = useMemo(() => (depth === null ? [] : calculate({ depth, extenders: ext, rings, baseMm })), [depth, ext, rings, baseMm]);
  const shown = filterByMode(results, mode);

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-extrabold">{title}</h2>}
      {depth === null ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Ange dörrdjup för att se resultat.</div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-destructive/40 bg-card p-5">
          <p className="font-bold text-destructive">Ingen godkänd lösning hittades för {formatMm(depth)}.</p>
          <p className="mt-1 text-sm text-muted-foreground">Kontrollera vilka förlängare och ringar som är markerade som i lager, och mät dörrdjupet igen.</p>
        </div>
      ) : (
        <>
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Bästa rekommendation</p>
            <ResultCard c={results[0]!} best />
          </div>
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${mode === m.id ? "bg-card shadow-card" : "text-muted-foreground"}`}
              >
                {m.label} <span className="font-mono text-xs opacity-60">{filterByMode(results, m.id).length}</span>
              </button>
            ))}
          </div>
          {shown.length === 0 ? (
            <p className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">Inga kombinationer i den här vyn. Prova "Alla godkända".</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {shown.map((c, i) => <ResultCard key={i} c={c} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ResultCard({ c, best }: { c: Combination; best?: boolean }) {
  const exact = c.deviation === 0;
  return (
    <div className={`rounded-xl border bg-card p-4 shadow-card ${best ? "border-2 border-accent" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Ring</p>
          <p className="font-mono text-2xl font-bold">{formatMm(c.ring)}</p>
        </div>
        <div className={`rounded-lg px-3 py-1.5 text-right ${exact ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}`}>
          <p className="font-mono text-lg font-bold">{formatSigned(c.deviation)}</p>
          <p className="text-[11px] font-semibold">{describeDeviation(c.deviation)}</p>
        </div>
      </div>
      <div className="mt-3 border-t pt-3">
        <p className="text-xs text-muted-foreground">Förlängare ({c.extenderCount} st)</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {c.extenders.length === 0 ? (
            <span className="text-sm font-semibold">Inga förlängare</span>
          ) : (
            c.extenders.map((e, i) => (
              <span key={i} className="rounded-md bg-secondary px-2 py-1 font-mono text-sm font-bold">{formatMm(e)}</span>
            ))
          )}
        </div>
        <p className="mt-2 text-sm">Sammanlagd förlängning: <span className="font-mono font-bold">{formatMm(c.totalExtension)}</span></p>
      </div>
    </div>
  );
}
