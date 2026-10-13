import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  calculate,
  filterByMode,
  describeDeviation,
  formatMm,
  formatSigned,
  EXTENDER_SIZES,
  RING_HEIGHTS,
  STANDARD_CYLINDER_MM,
  type Combination,
  type ViewMode,
} from "@/lib/cylinder";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cylinderkalkylatorn – förlängare och ringar för låssmeder" },
      { name: "description", content: "Räkna fram rätt kombination av cylinderförlängare och cylinderringar, för enkel- och dubbelcylinder." },
      { property: "og:title", content: "Cylinderkalkylatorn" },
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

function Index() {
  const [type, setType] = useState<"single" | "double">("single");
  const [outside, setOutside] = useState("");
  const [inside, setInside] = useState("");
  const [ext, setExt] = useState<number[]>([...EXTENDER_SIZES]);
  const [rings, setRings] = useState<number[]>([...RING_HEIGHTS]);

  const toggle = (list: number[], set: (v: number[]) => void, v: number) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Låssmedsverktyg</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Cylinderkalkylatorn</h1>
          <p className="mt-2 max-w-xl text-sm opacity-80">
            Standardcylinder {STANDARD_CYLINDER_MM} mm. Godkänd avvikelse −1 till +2 mm.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[340px_1fr]">
        <section className="space-y-5">
          <Panel title="Mätning">
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
            <DepthInput label={type === "single" ? "Dörrdjup" : "Dörrdjup utsida"} value={outside} onChange={setOutside} />
            {type === "double" && <DepthInput label="Dörrdjup insida" value={inside} onChange={setInside} />}
            <p className="text-xs text-muted-foreground">Avstånd från låshusets referenspunkt till dörrbladets yta.</p>
          </Panel>

          <Panel title="Förlängare i lager">
            <ChipGroup values={[...EXTENDER_SIZES]} selected={ext} onToggle={(v) => toggle(ext, setExt, v)} />
          </Panel>
          <Panel title="Ringhöjder i lager">
            <ChipGroup values={[...RING_HEIGHTS]} selected={rings} onToggle={(v) => toggle(rings, setRings, v)} />
          </Panel>
        </section>

        <section className="space-y-8">
          <Side title={type === "single" ? null : "Utsida"} depth={parse(outside)} ext={ext} rings={rings} />
          {type === "double" && <Side title="Insida" depth={parse(inside)} ext={ext} rings={rings} />}
        </section>
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-card">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h2>
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
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 font-mono text-sm font-bold transition ${on ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground line-through"}`}
          >
            <input type="checkbox" checked={on} onChange={() => onToggle(v)} className="accent-accent" />
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

function Side({ title, depth, ext, rings }: { title: string | null; depth: number | null; ext: number[]; rings: number[] }) {
  const [mode, setMode] = useState<ViewMode>("all");
  const results = useMemo(() => (depth === null ? [] : calculate({ depth, extenders: ext, rings })), [depth, ext, rings]);
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
            <ResultCard c={results[0]} best />
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
