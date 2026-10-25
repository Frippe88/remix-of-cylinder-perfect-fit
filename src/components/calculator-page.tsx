import { Link } from "@tanstack/react-router";
import { GUIDES } from "@/lib/guides";
import { ArrowRight, BookOpen, Check, FolderOpen, Info, KeyRound, Minus, Moon, Plus, ShieldCheck, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { CylinderResults } from "@/components/cylinder-results";
import { PickListButton } from "@/components/pick-list-button";
import { ProjectBar, ProjectPanel, useProject } from "@/components/project-panel";
import { nextDoorName, type DoorSide } from "@/lib/project";
import { DoorNameDialog } from "@/components/door-name-dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ShareSection } from "@/components/share-section";
import { trackEvent } from "@/lib/analytics";
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
    hint: "Cylinder med rund profil. Använder egna ringar (8mm och 13mm) och 10mm förlängare.",
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

export function CalculatorPage({ variant }: { variant: "free" | "pro" }) {
  const [type, setType] = useState<"single" | "double">("single");
  const [cyl, setCyl] = useState<Cyl>("standard");
  const [brand, setBrand] = useState<string>(ROUND_BRANDS[0]);
  const [outside, setOutside] = useState("");
  const [inside, setInside] = useState("");
  const [stdExt, setStdExt] = useState<number[]>([...EXTENDER_SIZES]);
  const [rings, setRings] = useState<number[]>([...RING_HEIGHTS]);
  const [roundExt, setRoundExt] = useState<number[]>([...ROUND_EXTENDER_SIZES]);
  const [roundRings, setRoundRings] = useState<number[]>([...ROUND_RING_HEIGHTS]);
  const pro = variant === "pro";
  const [project, setProject, projectStore] = useProject();
  const [projectOpen, setProjectOpen] = useState(false);
  const [switchProject, setSwitchProject] = useState(false);
  const [pendingDoor, setPendingDoor] = useState<{ sides: DoorSide[]; kind: "oval" | "rund" | "iloq" } | null>(null);
  const [singleSide, setSingleSide] = useState<"Utsida" | "Insida">("Utsida");

  const isRound = cyl === "round";
  const baseMm = cylinderBaseMm(cyl, "outside", type === "double", brand);
  const insideBaseMm = cylinderBaseMm(cyl, "inside", type === "double", brand);
  const iloqDouble = cyl === "iloq" && type === "double";
  const ringValues = isRound ? [...ROUND_RING_HEIGHTS] : cyl === "iloq" ? [...RING_HEIGHTS, ...ILOQ_RING_HEIGHTS] : [...RING_HEIGHTS];
  const extValues = isRound ? [...ROUND_EXTENDER_SIZES] : [...EXTENDER_SIZES];
  const ext = isRound ? roundExt : stdExt;
  const setExt = isRound ? setRoundExt : setStdExt;
  const activeRings = isRound ? roundRings : rings;
  const setActiveRings = isRound ? setRoundRings : setRings;

  // Valda alternativ för plocklistan; nollställs automatiskt när indata ändras.
  const selKey = [cyl, brand, type, outside, inside, ext.join(","), activeRings.join(",")].join("|");
  const [sel, setSel] = useState<{ key: string; out: Combination | null; in: Combination | null }>({ key: "", out: null, in: null });
  const selOut = sel.key === selKey ? sel.out : null;
  const selIn = sel.key === selKey ? sel.in : null;

  // GA4: räkna en beräkning när måtten stått still en stund (inte varje knapptryck).
  useEffect(() => {
    if (!outside && !inside) return;
    const t = setTimeout(() => trackEvent("berakning", { cylinder: cyl, typ: type, fabrikat: isRound ? brand : undefined }), 2500);
    return () => clearTimeout(t);
  }, [cyl, brand, type, outside, inside, isRound]);

  const toggle = (list: number[], set: (v: number[]) => void, v: number) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const switchCyl = (c: Cyl) => {
    setCyl(c);
    if (c === "standard") setRings((r) => r.filter((v) => !(ILOQ_RING_HEIGHTS as readonly number[]).includes(v)));
    else if (c === "iloq") setRings((r) => [...new Set([...r, ...ILOQ_RING_HEIGHTS])]);
  };

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden bg-primary bg-header text-primary-foreground">
        <div aria-hidden className="blueprint pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1 bg-accent" />
        <div className="relative mx-auto flex max-w-5xl items-center gap-2.5 px-4 py-3 sm:gap-3 sm:py-6">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent shadow-elevated sm:size-12">
            <KeyRound className="size-5 text-accent-foreground sm:size-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-extrabold leading-tight tracking-tight sm:text-2xl">
              Cylinderhjälpen<span className="hidden sm:inline"> – kalkylator för rätt mått och montage</span>
            </h1>
            <p className="truncate text-[11px] leading-tight opacity-80 sm:hidden">Kalkylator för rätt mått och montage</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            {pro && <button type="button" onClick={() => { setSwitchProject(false); setProjectOpen(true); }} aria-label="Öppna projekt"
              className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary-foreground/10 px-2 text-sm font-semibold ring-1 ring-primary-foreground/25 hover:bg-primary-foreground/20 sm:h-10 sm:gap-1.5 sm:px-3">
              <FolderOpen className="size-4 text-accent" aria-hidden /><span className="hidden sm:inline">Projekt</span>
              <span className="hidden rounded-full border border-accent/50 bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent sm:inline">Beta</span>
              <span className="rounded-full bg-accent px-1.5 text-xs font-bold text-accent-foreground">{projectStore.list.length}</span>
            </button>}
          </div>
        </div>
        <div className="relative mx-auto flex max-w-5xl flex-wrap gap-1.5 px-4 pb-3 sm:pb-6" aria-label="Regler">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2 py-1 text-[11px] font-semibold text-accent ring-1 ring-accent/40 sm:px-2.5 sm:text-xs">
            <ShieldCheck className="size-3.5" aria-hidden />Oval & iLOQ: −2 till +2mm
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-2 py-1 text-[11px] font-semibold ring-1 ring-primary-foreground/25 sm:px-2.5 sm:text-xs">
            <Check className="size-3.5" aria-hidden />Rund: närmaste möjliga
          </span>
        </div>
      </header>
      <nav aria-label="Version" className="mx-auto flex max-w-5xl gap-2 px-4 pt-4">
        {([["free", "/", "Snabbkalkyl", "Gratis"], ["pro", "/pro", "Projekt & behör", "Pro"]] as const).map(([v, to, label, tag]) => (
          <Link key={v} to={to} aria-current={variant === v ? "page" : undefined}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${variant === v ? "border-accent bg-accent/10 ring-1 ring-accent" : "border-input bg-card hover:bg-muted"}`}>
            {label}<span className="rounded-full border border-accent/50 bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">{tag}</span>
          </Link>
        ))}
      </nav>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[340px_1fr]">
        <section className="contents lg:block">
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
                  className={`w-full rounded-lg border p-3 text-left transition ${cyl === o.id ? "border-accent bg-accent/10 shadow-card ring-1 ring-accent" : "border-input bg-card hover:border-foreground/30 hover:bg-muted"}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold">{o.name}</span>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-xs font-bold ${cyl === o.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                      {o.id === "round" ? baseMm : o.mm}mm
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
                <span className="mt-2 block rounded-lg border-l-4 border-accent bg-accent/10 px-3 py-2.5 text-sm font-medium leading-snug text-foreground">
                  <span className="block font-bold">
                    {brand === "ASSA ABLOY" ? "ASSA ABLOY räknas med 33mm" : `${brand === "Annat fabrikat" ? "Annat fabrikat" : brand === "EVVA" ? "EVVA" : "dormakaba"} räknas med 31mm`}
                  </span>
                  <span className="mt-1 block">
                    {brand === "ASSA ABLOY"
                      ? "Råcylindern är 31mm, men cylinderhylsan (koppen) som sitter på bygger ut den till 33mm. Därför skiljer sig måttet – det är inget fel."
                      : brand === "dormakaba / DORMA" || brand === "EVVA"
                        ? `${brand === "EVVA" ? "EVVA" : "dormakaba"} har ingen kopp eller hylsa som bygger ut – cylindern monteras direkt mot låshuset och ringen låses med stoppskruv. 31mm är rätt mått.`
                        : "Standardmått för rund cylinder utan kopp eller hylsa."}
                  </span>
                  <span className="mt-1 block text-foreground/80">Rund cylinder har ingen fast toleransregel – kalkylatorn väljer alltid närmaste möjliga utstick.</span>
                </span>
              </label>
            )}
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["single", "double"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-md py-2 text-sm font-semibold transition ${type === t ? "bg-card shadow-card ring-1 ring-border" : "text-muted-foreground"}`}
                >
                  {t === "single" ? "Enkelcylinder" : "Dubbelcylinder"}
                </button>
              ))}
            </div>
            {type === "single" && !isRound && (
              <div>
                <p className="text-xs text-muted-foreground">Var sitter cylindern? Ringen för <span className="font-semibold text-side-outside">utsida</span> och <span className="font-semibold text-side-inside">insida</span> ser olika ut.</p>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {(["Utsida", "Insida"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setSingleSide(s)} aria-pressed={singleSide === s}
                      className={`min-h-10 rounded-lg border text-sm font-semibold transition ${singleSide === s ? (s === "Utsida" ? "border-side-outside/45 bg-side-outside-soft text-side-outside" : "border-side-inside/45 bg-side-inside-soft text-side-inside") : "border-input text-muted-foreground"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {type === "double" && (
              <p className="text-xs text-muted-foreground">Cylinder på både utsida och insida.</p>
            )}
            {iloqDouble && (
              <div role="note" className="flex gap-3 rounded-xl border border-accent/50 bg-accent/10 p-3 text-sm">
                <Info className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                <p>
                  <span className="font-bold">iLOQ dubbelcylinder: +{ILOQ_DOUBLE_INSIDE_EXTRA_MM}mm på insidan.</span>{" "}
                  <span className="text-muted-foreground">Kitets två monteringsbrickor (3mm styck) bygger ut cylindern, så insidan räknas med {insideBaseMm}mm istället för {ILOQ_CYLINDER_MM}mm.</span>
                </p>
              </div>
            )}
            <p className="rounded-lg border-l-4 border-accent bg-accent/10 px-3 py-2 text-sm font-medium text-foreground">Dörrdjup = avstånd från låshusets referenspunkt till dörrbladets yta.</p>
            <DepthInput label={type === "single" ? "Dörrdjup" : "Dörrdjup utsida"} value={outside} onChange={setOutside} />
            {type === "double" && <DepthInput label="Dörrdjup insida" value={inside} onChange={setInside} />}
          </Panel>

          <div className="order-3 space-y-5 lg:order-none lg:mt-5">
            <Panel title="Förlängare i lager">
              <ChipGroup values={extValues} selected={ext} onToggle={(v) => toggle(ext, setExt, v)} />
            </Panel>
            <Panel title="Ringhöjder i lager">
              <ChipGroup values={ringValues} selected={activeRings} onToggle={(v) => toggle(activeRings, setActiveRings, v)} />
            </Panel>
          </div>
        </section>

        <section className="order-2 min-w-0 space-y-7 lg:order-none">
          <PickListButton
            sides={type === "single" ? [{ label: isRound ? null : singleSide, depth: parse(outside), selected: selOut }] : [{ label: "Utsida", depth: parse(outside), selected: selOut }, { label: "Insida", depth: parse(inside), selected: selIn }]}
            ext={ext} rings={activeRings} baseMm={baseMm} insideBaseMm={insideBaseMm} relaxed={isRound}
            {...(pro ? { projectName: project.name, projectDoors: project.doors.length, projectCount: projectStore.list.length, onOpenProject: () => { setSwitchProject(true); setProjectOpen(true); } } : {})}
            onSave={!pro ? undefined : (sides) => { trackEvent("sparad_dorr", { cylinder: cyl }); setPendingDoor({ sides, kind: isRound ? "rund" : cyl === "iloq" ? "iloq" : "oval" }); }}
          />
          <CylinderResults title={type === "single" ? null : "Utsida"} depth={parse(outside)} ext={ext} rings={activeRings} baseMm={baseMm} relaxed={isRound} selected={selOut} onSelect={(c) => setSel({ key: selKey, out: c, in: selIn })} />
          {type === "double" && <CylinderResults title="Insida" depth={parse(inside)} ext={ext} rings={activeRings} baseMm={insideBaseMm} relaxed={isRound} selected={selIn} onSelect={(c) => setSel({ key: selKey, out: selOut, in: c })} />}
        </section>
      </main>
      {pro && <>
      <DoorNameDialog open={!!pendingDoor} defaultName={nextDoorName(project.doors)} projectName={project.name} onCancel={() => setPendingDoor(null)}
        onConfirm={(name) => {
          if (!pendingDoor) return;
          const { sides, kind } = pendingDoor;
          setProject((p) => ({ ...p, doors: [...p.doors, { id: `${Date.now()}`, name, kind, done: false, sides }] }));
          setPendingDoor(null);
          toast.success(`${name} tillagd i ${project.name.trim() ? `”${project.name.trim()}”` : "projektet"}`);
        }} />
      <ProjectBar project={project} projects={projectStore.list.length} onOpen={() => { setSwitchProject(false); setProjectOpen(true); }} />
      <ProjectPanel project={project} setProject={setProject} store={projectStore} open={projectOpen} onOpenChange={(v) => { setProjectOpen(v); if (!v) setSwitchProject(false); }} closeOnSelect={switchProject} />
      </>}
      <Toaster position="top-center" />
      <section className="mx-auto mt-10 w-full max-w-5xl px-4">
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Guider om cylindermontage</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((g) => (
            <li key={g.slug} className="h-full">
              <Link to="/guider/$slug" params={{ slug: g.slug }} className="group flex h-full items-center justify-between gap-3 rounded-xl border bg-card p-4 text-sm font-semibold shadow-card transition hover:-translate-y-0.5 hover:border-accent hover:shadow-elevated">
                <span className="flex items-center gap-3"><BookOpen className="size-4 shrink-0 text-accent" aria-hidden />{g.title}</span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <ShareSection />
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4 shadow-card">
      <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-foreground"><span className="h-3.5 w-1 rounded-full bg-accent" aria-hidden />{title}</h2>
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

