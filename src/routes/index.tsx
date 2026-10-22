import { createFileRoute } from "@tanstack/react-router";
import { Check, Info, KeyRound, Minus, Moon, Plus, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { CylinderResults } from "@/components/cylinder-results";
import { PickListButton } from "@/components/pick-list-button";
import { ContactForm } from "@/components/contact-form";
import {
  formatMm,
  EXTENDER_SIZES,
  RING_HEIGHTS,
  ILOQ_RING_HEIGHTS,
  STANDARD_CYLINDER_MM,
  ILOQ_CYLINDER_MM,
  ILOQ_DOUBLE_INSIDE_EXTRA_MM,
  cylinderBaseMm,
  ROUND_CYLINDER_MM,
  ROUND_EXTENDER_SIZES,
  ROUND_RING_HEIGHTS,
  type Combination,
} from "@/lib/cylinder";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cylinderhjälpen – cylinderkalkylator för låssmeder" },
      { name: "description", content: "Cylinderhjälpen räknar fram rätt kombination av cylinderförlängare och cylinderringar, för enkel- och dubbelcylinder." },
      { name: "application-name", content: "Cylinderhjälpen" },
      { property: "og:site_name", content: "Cylinderhjälpen" },
      { property: "og:title", content: "Cylinderhjälpen – cylinderkalkylator för låssmeder" },
      { property: "og:description", content: "Exakt beräkning av cylinderförlängare och ringar för låssmeder." },
      { property: "og:url", content: "https://xn--cylinderhjlpen-fib.se/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Cylinderhjälpen" },
    ],
    links: [{ rel: "canonical", href: "https://xn--cylinderhjlpen-fib.se/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Cylinderhjälpen",
          alternateName: "cylinderhjälpen.se",
          url: "https://cylinderhjälpen.se/",
          inLanguage: "sv",
        }),
      },
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

const ROUND_BRANDS = ["ASSA ABLOY", "dormakaba / DORMA", "EVVA", "Annat fabrikat"] as const;

function Index() {
  const [type, setType] = useState<"single" | "double">("single");
  const [cyl, setCyl] = useState<Cyl>("standard");
  const [brand, setBrand] = useState<string>(ROUND_BRANDS[0]);
  const [outside, setOutside] = useState("");
  const [inside, setInside] = useState("");
  const [stdExt, setStdExt] = useState<number[]>([...EXTENDER_SIZES]);
  const [rings, setRings] = useState<number[]>([...RING_HEIGHTS]);
  const [roundExt, setRoundExt] = useState<number[]>([...ROUND_EXTENDER_SIZES]);
  const [roundRings, setRoundRings] = useState<number[]>([...ROUND_RING_HEIGHTS]);

  const isRound = cyl === "round";
  const baseMm = cylinderBaseMm(cyl, "outside", type === "double");
  const insideBaseMm = cylinderBaseMm(cyl, "inside", type === "double");
  const iloqDouble = cyl === "iloq" && type === "double";
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
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4 px-4 py-6 sm:py-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/40 sm:size-14">
              <KeyRound className="size-6 text-accent sm:size-7" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">Cylinderhjälpen</h1>
              <p className="mt-0.5 text-sm opacity-80">Snabb och enkel cylinderberäkning för ett snyggt montage</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-accent">Oval cylinder: godkänd avvikelse −2 till +2 mm · Rund: närmaste möjliga</p>
            </div>
          </div>
          <ThemeToggle />
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
            {isRound && (
              <label className="block text-sm font-semibold text-foreground">
                Fabrikat
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-input bg-card px-3 py-3 text-base font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ROUND_BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <span className="mt-1 block text-xs font-normal text-muted-foreground">Runda cylindrar har ingen fast toleransregel – kalkylatorn väljer alltid närmaste möjliga utstick. Mått per fabrikat läggs in när de är verifierade. Tills vidare räknas alla med 31 mm.</span>
              </label>
            )}
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
            ext={ext} rings={activeRings} baseMm={baseMm} insideBaseMm={insideBaseMm} relaxed={isRound}
          />
          <CylinderResults title={type === "single" ? null : "Utsida"} depth={parse(outside)} ext={ext} rings={activeRings} baseMm={baseMm} relaxed={isRound} selected={selOut} onSelect={(c) => setSel({ key: selKey, out: c, in: selIn })} />
          {type === "double" && (
            <div className="space-y-3">
              {iloqDouble && (
                <div role="note" className="flex gap-3 rounded-xl border border-accent/50 bg-accent/10 p-3 text-sm">
                  <Info className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                  <p>
                    <span className="font-bold">iLOQ dubbelcylinder: +{ILOQ_DOUBLE_INSIDE_EXTRA_MM} mm på insidan.</span>{" "}
                    <span className="text-muted-foreground">Kitets två monteringsbrickor (3 mm styck) bygger ut cylindern, så insidan räknas med {insideBaseMm} mm istället för {ILOQ_CYLINDER_MM} mm.</span>
                  </p>
                </div>
              )}
              <CylinderResults title="Insida" depth={parse(inside)} ext={ext} rings={activeRings} baseMm={insideBaseMm} relaxed={isRound} selected={selIn} onSelect={(c) => setSel({ key: selKey, out: selOut, in: c })} />
            </div>
          )}
        </section>
      </main>
      <ContactForm />
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

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const flip = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* ignore */ }
  };
  return (
    <button
      onClick={flip}
      aria-label={dark ? "Byt till ljust läge" : "Byt till mörkt läge"}
      className="flex size-11 shrink-0 items-center justify-center rounded-lg ring-1 ring-primary-foreground/25 transition hover:bg-primary-foreground/10"
    >
      {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
    </button>
  );
}

function DepthInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const step = (d: number) => {
    const n = parse(value) ?? 0;
    onChange(String(Math.max(0, Math.round((n + d) * 10) / 10)).replace(".", ","));
  };
  const btn = "flex size-12 shrink-0 items-center justify-center text-foreground transition hover:bg-muted active:bg-muted";
  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={label}>{label}</label>
      <div className="mt-1 flex items-center overflow-hidden rounded-lg border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
        <button type="button" onClick={() => step(-1)} aria-label={`Minska ${label.toLowerCase()} 1 mm`} className={`${btn} border-r border-input`}>
          <Minus className="size-5" aria-hidden />
        </button>
        <input
          id={label}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, "").slice(0, 6))}
          placeholder="t.ex. 36"
          className="w-full min-w-0 bg-transparent px-3 py-3 text-center font-mono text-xl font-bold outline-none"
        />
        <span className="pr-2 text-sm text-muted-foreground">mm</span>
        <button type="button" onClick={() => step(1)} aria-label={`Öka ${label.toLowerCase()} 1 mm`} className={`${btn} border-l border-input`}>
          <Plus className="size-5" aria-hidden />
        </button>
      </div>
    </div>
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

