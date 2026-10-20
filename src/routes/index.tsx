import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { CylinderResults } from "@/components/cylinder-results";
import { PickListButton } from "@/components/pick-list-button";
import {
  formatMm,
  EXTENDER_SIZES,
  RING_HEIGHTS,
  ILOQ_RING_HEIGHTS,
  STANDARD_CYLINDER_MM,
  ILOQ_CYLINDER_MM,
  ROUND_CYLINDER_MM,
  ROUND_EXTENDER_SIZES,
  ROUND_RING_HEIGHTS,
  type Combination,
} from "@/lib/cylinder";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cylinderhjälpen" },
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
    id: "round" as const,
    name: "Rund cylinder",
    mm: ROUND_CYLINDER_MM,
    hint: "Cylinder med rund profil. Använder egna ringar (8 och 13 mm) och 10 mm förlängare.",
  },
  {
    id: "iloq" as const,
    name: "iLOQ-cylinder",
    mm: ILOQ_CYLINDER_MM,
    hint: "Elektronisk cylinder utan vanligt nyckelhål.",
  },
];

type Cyl = "standard" | "round" | "iloq";

function Index() {
  const [type, setType] = useState<"single" | "double">("single");
  const [cyl, setCyl] = useState<Cyl>("standard");
  const [outside, setOutside] = useState("");
  const [inside, setInside] = useState("");
  const [stdExt, setStdExt] = useState<number[]>([...EXTENDER_SIZES]);
  const [rings, setRings] = useState<number[]>([...RING_HEIGHTS]);
  const [roundExt, setRoundExt] = useState<number[]>([...ROUND_EXTENDER_SIZES]);
  const [roundRings, setRoundRings] = useState<number[]>([...ROUND_RING_HEIGHTS]);

  const isRound = cyl === "round";
  const baseMm = cyl === "iloq" ? ILOQ_CYLINDER_MM : isRound ? ROUND_CYLINDER_MM : STANDARD_CYLINDER_MM;
  const ringValues = isRound ? [...ROUND_RING_HEIGHTS] : cyl === "iloq" ? [...RING_HEIGHTS, ...ILOQ_RING_HEIGHTS] : [...RING_HEIGHTS];
  const extValues = isRound ? [...ROUND_EXTENDER_SIZES] : [...EXTENDER_SIZES];
  const ext = isRound ? roundExt : stdExt;
  const setExt = isRound ? setRoundExt : setStdExt;
  const activeRings = isRound ? roundRings : rings;
  const setActiveRings = isRound ? setRoundRings : setRings;

  // Valda alternativ för plocklistan; nollställs automatiskt när indata ändras.
  const selKey = [cyl, type, outside, inside, ext.join(","), activeRings.join(",")].join("|");
  const [sel, setSel] = useState<{ key: string; out: Combination | null; in: Combination | null }>({ key: "", out: null, in: null });
  const selOut = sel.key === selKey ? sel.out : null;
  const selIn = sel.key === selKey ? sel.in : null;

  const toggle = (list: number[], set: (v: number[]) => void, v: number) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const switchCyl = (c: Cyl) => {
    setCyl(c);
    if (c === "standard") setRings((r) => r.filter((v) => !(ILOQ_RING_HEIGHTS as readonly number[]).includes(v)));
    else if (c === "iloq") setRings((r) => [...new Set([...r, ...ILOQ_RING_HEIGHTS])]);
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
              Välj den cylinder du ska sätta in. Oval cylinder är vanligast – rund cylinder har rund profil och egna ringar och förlängare, medan iLOQ gäller bara om cylindern eller låset är märkt iLOQ.
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
            <ChipGroup values={extValues} selected={ext} onToggle={(v) => toggle(ext, setExt, v)} />
          </Panel>
          <Panel title="Ringhöjder i lager">
            <ChipGroup values={ringValues} selected={activeRings} onToggle={(v) => toggle(activeRings, setActiveRings, v)} />
          </Panel>
        </section>

        <section className="min-w-0 space-y-7">
          <PickListButton
            sides={type === "single" ? [{ label: null, depth: parse(outside), selected: selOut }] : [{ label: "Utsida", depth: parse(outside), selected: selOut }, { label: "Insida", depth: parse(inside), selected: selIn }]}
            ext={ext} rings={activeRings} baseMm={baseMm} relaxed={isRound}
          />
          <CylinderResults title={type === "single" ? null : "Utsida"} depth={parse(outside)} ext={ext} rings={activeRings} baseMm={baseMm} relaxed={isRound} selected={selOut} onSelect={(c) => setSel({ key: selKey, out: c, in: selIn })} />
          {type === "double" && <CylinderResults title="Insida" depth={parse(inside)} ext={ext} rings={activeRings} baseMm={baseMm} relaxed={isRound} selected={selIn} onSelect={(c) => setSel({ key: selKey, out: selOut, in: c })} />}
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

