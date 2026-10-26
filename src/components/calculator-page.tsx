import { Link } from "@tanstack/react-router";
import { GUIDES } from "@/lib/guides";
import { ArrowRight, BookOpen, Check, CircleHelp, FolderOpen, Info, KeyRound, Minus, Moon, Package, Plus, ShieldCheck, Sun } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { CylinderResults, ModePicker } from "@/components/cylinder-results";
import type { ViewMode } from "@/lib/cylinder";
import { PickListButton } from "@/components/pick-list-button";
import { ProjectBar, ProjectPanel, useProject } from "@/components/project-panel";
import { InfoSheetRow } from "@/components/info-sheet-row";
import { ProDialog } from "@/components/pro-dialog";
import { fittingOptions, nextDoorName, type DoorSide, type Fitting } from "@/lib/project";
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
  ASSA_S_BRAND,
  ASSA_ROUND_BRAND,
  ASSA_S_RING_HEIGHTS,
  roundRingHeights,
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
    hint: "Vanlig oval nyckelcylinder – kallas också euro- eller systemcylinder.",
  },
  {
    id: "round" as const,
    name: "Rund cylinder",
    mm: ROUND_CYLINDER_MM,
    hint: "Rund profil – egna ringar och 10mm förlängare.",
  },
  {
    id: "iloq" as const,
    name: "iLOQ-cylinder",
    mm: ILOQ_CYLINDER_MM,
    hint: "Elektronisk cylinder utan vanligt nyckelhål.",
  },
];

type Cyl = "standard" | "round" | "iloq";

const ROUND_BRANDS = [ASSA_ROUND_BRAND, ASSA_S_BRAND, "dormakaba / DORMA", "EVVA", "Annat fabrikat"] as const;

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
  const [proOpen, setProOpen] = useState(false);
  useEffect(() => { if (pro) setProOpen(true); }, [pro]);
  const [projectOpen, setProjectOpen] = useState(false);
  const [switchProject, setSwitchProject] = useState(false);
  const [pendingDoor, setPendingDoor] = useState<{ sides: DoorSide[]; kind: "oval" | "rund" | "iloq"; fitting?: Fitting } | null>(null);
  const [fitting, setFitting] = useState<Fitting | null>(null);
  const fittingChoices = fittingOptions(variant, cyl, type, brand);
  const fittingEnabled = fittingChoices.length > 0;
  // Dubbel iLOQ kräver alltid A10.11-kitet: förvalt automatiskt.
  const activeFitting = fitting && fittingChoices.includes(fitting) ? fitting
    : cyl === "iloq" && type === "double" && fittingChoices.includes("A10.11") ? "A10.11" : null;
  const [singleSide, setSingleSide] = useState<"Utsida" | "Insida">("Utsida");
  const [mode, setMode] = useState<ViewMode>("all");

  const isRound = cyl === "round";
  const baseMm = cylinderBaseMm(cyl, "outside", type === "double", brand);
  const insideBaseMm = cylinderBaseMm(cyl, "inside", type === "double", brand);
  const iloqDouble = cyl === "iloq" && type === "double";
  const isAssaS = isRound && brand === ASSA_S_BRAND;
  const isAssaRound = isRound && brand === ASSA_ROUND_BRAND;
  const ringValues = isRound ? roundRingHeights(brand) : cyl === "iloq" ? [...RING_HEIGHTS, ...ILOQ_RING_HEIGHTS] : [...RING_HEIGHTS];
  const extValues = isRound ? [...ROUND_EXTENDER_SIZES] : [...EXTENDER_SIZES];
  const ext = isRound ? roundExt : stdExt;
  const setExt = isRound ? setRoundExt : setStdExt;
  const activeRings = isAssaS ? [...ASSA_S_RING_HEIGHTS] : isRound ? roundRings : rings;
  const setActiveRings = isRound ? setRoundRings : setRings;
  // Dubbel iLOQ: insidan kräver iLOQ:s egna innerringar (27/30/33 mm) med skruvhål.
  const insideRings = iloqDouble ? activeRings.filter((r) => (ILOQ_RING_HEIGHTS as readonly number[]).includes(r)) : activeRings;
  const insideExt = iloqDouble ? [] : ext;

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
    setFitting(null);
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
        {([["free", "/", "Cylinderkalkyl", "Gratis"], ["pro", "/pro", "Cylinderkalkyl", "Pro"]] as const).map(([v, to, label, tag]) => (
          <Link key={v} to={to} aria-current={variant === v ? "page" : undefined}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${variant === v ? "border-accent bg-accent/10 ring-1 ring-accent" : "border-input bg-card hover:bg-muted"}`}>
            {label}<span className="rounded-full border border-accent/50 bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">{tag}</span>
          </Link>
        ))}
      </nav>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[340px_1fr]">
        <section className="contents lg:block">
          <div className="rounded-xl border bg-card shadow-card">
            <InfoSheetRow icon={<CircleHelp />} title="Hur gör jag?" hint="Så räknar du en dörr – kort och enkelt">
              <ol className="space-y-3 text-sm leading-snug">
                <li><span className="font-bold">1. Välj cylindertyp.</span> Oval, rund eller iLOQ – valet stannar kvar medan du räknar flera dörrar i rad.</li>
                <li><span className="font-bold">2. Välj enkel- eller dubbelcylinder.</span> Dubbel = cylinder på både utsida och insida, måtten räknas separat.</li>
                <li><span className="font-bold">3. Mät dörrdjupet.</span> Avstånd från låshusets referenspunkt till dörrbladets yta.</li>
                <li><span className="font-bold">4. Kolla toleransen.</span> Oval och iLOQ: −2 till +2mm. Rund: ingen fast regel, kalkylatorn tar närmaste möjliga.</li>
                <li><span className="font-bold">5. Ställ in lagret.</span> Under Mitt lager bockar du av vilka ringhöjder och förlängare du har med dig.</li>
                <li><span className="font-bold">6. Tryck på förslaget.</span> Då hamnar ringar, förlängare och behör i plocklistan.{pro ? " Spara dörren i projektet för inköpslista och PDF." : ""}</li>
              </ol>
            </InfoSheetRow>
          </div>
          <Panel title="Mätning">
            <div className="grid grid-cols-3 gap-0.5 rounded-lg bg-muted p-1 sm:gap-1" role="group" aria-label="Cylindertyp">
              {CYLINDER_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => switchCyl(o.id)}
                  aria-pressed={cyl === o.id}
                  className={`rounded-md px-0.5 py-2 text-center text-[11px] font-bold leading-tight whitespace-nowrap transition sm:px-1 sm:text-[13px] ${cyl === o.id ? "bg-accent text-accent-foreground shadow-card" : "text-muted-foreground hover:bg-card"}`}
                >
                  {o.name}
                  <span className="mt-0.5 block font-mono text-[13px] font-bold">{o.id === "round" ? baseMm : o.mm}mm</span>
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
                    {isAssaS ? "S-serien räknas med 33mm och fast 15mm ring" : isAssaRound ? "ASSA ABLOY d12 räknas med 33mm och inställbar ring" : `${brand === "Annat fabrikat" ? "Annat fabrikat" : brand === "EVVA" ? "EVVA" : "dormakaba"} räknas med 31mm`}
                  </span>
                  <span className="mt-1 block">
                    {isAssaS
                      ? "Gäller Triton, Neptun, dp och Combi med S i namnet (t.ex. 48S12) och behör 3211S/3212S. Ringen finns bara i 15mm – resten justeras med 10mm förlängare."
                      : isAssaRound
                      ? "Gäller vanlig rund ASSA-cylinder utan S i namnet (t.ex. 4812). Ringen är inställbar och låses i 8 eller 13mm med stoppskruv. Råcylindern är 31mm, men cylinderhylsan (koppen) som sitter på bygger ut den till 33mm. Därför skiljer sig måttet – det är inget fel."
                      : brand === "dormakaba / DORMA" || brand === "EVVA"
                        ? `${brand === "EVVA" ? "EVVA" : "dormakaba"} har ingen kopp eller hylsa som bygger ut – cylindern monteras direkt mot låshuset och ringen låses med stoppskruv. 31mm är rätt mått.`
                        : "Standardmått för rund cylinder utan kopp eller hylsa."}
                  </span>
                </span>
              </label>
            )}
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(["single", "double"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setType(t); setFitting(null); }}
                  className={`rounded-md py-2 text-sm font-semibold transition ${type === t ? "bg-card shadow-card ring-1 ring-border" : "text-muted-foreground"}`}
                >
                  {t === "single" ? "Enkelcylinder" : "Dubbelcylinder"}
                </button>
              ))}
            </div>
            {type === "single" && !isRound && (
              <div>
                <p className="text-xs text-muted-foreground">Var sitter cylindern? <span className="font-semibold text-side-outside">Utsida</span> och <span className="font-semibold text-side-inside">insida</span> har olika ring.</p>
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
            {iloqDouble && (
              <div role="note" className="flex gap-3 rounded-xl border border-accent/50 bg-accent/10 p-3 text-sm">
                <Info className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
                <p>
                  <span className="font-bold">iLOQ dubbelcylinder: +{ILOQ_DOUBLE_INSIDE_EXTRA_MM}mm på insidan.</span>{" "}
                  <span className="text-muted-foreground">Kitets två monteringsbrickor (3mm styck) bygger ut cylindern, så insidan räknas med {insideBaseMm}mm istället för {ILOQ_CYLINDER_MM}mm.</span>
                </p>
              </div>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-input bg-muted/40 px-3 py-2 text-left transition hover:bg-muted">
                  <span className="flex items-center gap-2.5">
                    <Package className="size-4 shrink-0 text-accent" aria-hidden />
                    <span className="text-sm font-bold">Mitt lager</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {activeRings.length} ringhöjder · {ext.length} förlängare
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Mitt lager</DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold">Förlängare i lager</h3>
                    <ChipGroup values={extValues} selected={ext} onToggle={(v) => toggle(ext, setExt, v)} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold">Ringhöjder i lager</h3>
                    <ChipGroup values={ringValues} selected={activeRings} onToggle={(v) => toggle(activeRings, setActiveRings, v)} />
                  </div>
                </div>
                <DialogClose asChild>
                  <button type="button" className="mt-2 min-h-11 w-full rounded-lg bg-accent text-sm font-bold text-accent-foreground">Klar</button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            <DepthInput label={type === "single" ? "Dörrdjup" : "Dörrdjup utsida"} value={outside} onChange={setOutside} />
            {type === "double" && <DepthInput label="Dörrdjup insida" value={inside} onChange={setInside} />}
          </Panel>
        </section>

        <section className="order-2 min-w-0 space-y-7 lg:order-none">
          <PickListButton
            sides={type === "single" ? [{ label: isRound ? null : singleSide, depth: parse(outside), selected: selOut }] : [{ label: "Utsida", depth: parse(outside), selected: selOut }, { label: "Insida", depth: parse(inside), selected: selIn }]}
            ext={ext} rings={activeRings} insideRings={insideRings} insideExt={insideExt} baseMm={baseMm} insideBaseMm={insideBaseMm} relaxed={isRound}
            fitting={activeFitting} onFittingChange={fittingEnabled ? setFitting : undefined} fittingChoices={fittingChoices} iloqDouble={iloqDouble}
            {...(pro ? { projectName: project.name, projectDoors: project.doors.length, projectCount: projectStore.list.length, onOpenProject: () => { setSwitchProject(true); setProjectOpen(true); } } : {})}
            onSave={!pro ? undefined : (sides) => { trackEvent("sparad_dorr", { cylinder: cyl }); setPendingDoor({ sides, kind: isRound ? "rund" : cyl === "iloq" ? "iloq" : "oval", ...(activeFitting ? { fitting: activeFitting } : {}) }); }}
          />
          <ModePicker mode={mode} onChange={(m) => { setMode(m); setSel({ key: "", out: null, in: null }); }} />
          <CylinderResults mode={mode} title={type === "single" ? null : "Utsida"} depth={parse(outside)} ext={ext} rings={activeRings} baseMm={baseMm} relaxed={isRound} selected={selOut} onSelect={(c) => setSel((s) => ({ key: selKey, out: c, in: s.key === selKey ? s.in : null }))} />
          {type === "double" && <CylinderResults mode={mode} title="Insida" depth={parse(inside)} ext={insideExt} rings={insideRings} baseMm={insideBaseMm} relaxed={isRound} selected={selIn} onSelect={(c) => setSel((s) => ({ key: selKey, out: s.key === selKey ? s.out : null, in: c }))} />}
        </section>
      </main>
      {pro && <>
      <DoorNameDialog open={!!pendingDoor} defaultName={nextDoorName(project.doors)} projectName={project.name} onCancel={() => setPendingDoor(null)}
        onConfirm={(name) => {
          if (!pendingDoor) return;
          const { sides, kind, fitting } = pendingDoor;
          setProject((p) => ({ ...p, doors: [...p.doors, { id: `${Date.now()}`, name, kind, done: false, sides, ...(fitting ? { fitting } : {}) }] }));
          setPendingDoor(null);
          toast.success(`${name} tillagd i ${project.name.trim() ? `”${project.name.trim()}”` : "projektet"}`);
        }} />
      <ProDialog open={proOpen} onOpenChange={setProOpen} />
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

