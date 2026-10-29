import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUND_NO_UNDERCUT_RINGS,
  calculate, filterByMode, preferOvalScrewFit, iloqSingleScrewSet, ovalSingleScrewSet, describeDeviation, formatMm, formatSigned,
  TOLERANCE_MIN, TOLERANCE_MAX, type Combination, type ViewMode, type ScrewFn,
} from "@/lib/cylinder";

const MODES: { id: ViewMode; label: string }[] = [
  { id: "all", label: "Alla" },
  { id: "exact", label: "Exakt 0mm" },
  { id: "fewer", label: "Färre förlängare" },
];
const PAGE_SIZE = 4;

function SideBadge({ side }: { side: string | null }) {
  if (!side) return null;
  const inside = side === "Insida";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${inside ? "bg-side-inside-soft text-side-inside" : "bg-side-outside-soft text-side-outside"}`}>
      {inside ? <ArrowDown className="size-3" aria-hidden /> : <ArrowUp className="size-3" aria-hidden />}
      {side}
    </span>
  );
}

type Sel = { selected?: Combination | null; onSelect?: (c: Combination) => void };

export function ModePicker({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Vad ska prioriteras?</p>
      <div role="group" aria-label="Prioritering" className="grid grid-cols-3 gap-1 rounded-md bg-muted p-1">
        {MODES.map(m => <Button key={m.id} variant="ghost" size="sm" aria-pressed={mode === m.id} onClick={() => onChange(m.id)} className={`min-h-10 px-1 text-xs hover:bg-card ${mode === m.id ? "bg-card text-foreground shadow-card" : "text-muted-foreground"}`}>{m.label}</Button>)}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{mode === "all" ? "Alla kombinationer, närmast 0mm först." : mode === "exact" ? "Bara kombinationer exakt i liv med ringen." : "Minst antal förlängare inom −2 till +2mm"}</p>
    </div>
  );
}

export function CylinderResults({ title, depth, ext, rings, baseMm, relaxed = false, selected = null, onSelect, mode = "all", ovalSingle = false, iloqSingle = false, preferred }: {
  preferred?: Combination | undefined; ovalSingle?: boolean; iloqSingle?: boolean; title: string | null; depth: number | null; ext: number[]; rings: number[]; baseMm: number; relaxed?: boolean; mode?: ViewMode;
} & Sel) {
  const screwFn = iloqSingle ? iloqSingleScrewSet : ovalSingle ? ovalSingleScrewSet : null;
  const results = useMemo(() => {
    if (depth === null) return [];
    const strict = calculate({ depth, extenders: ext, rings, baseMm, relaxed, noUndercutRings: relaxed ? [...ROUND_NO_UNDERCUT_RINGS] : [] });
    // Fallback: om inget ligger inom toleransen, visa ändå bästa möjliga (med varning).
    if (strict.length === 0 && !relaxed) return calculate({ depth, extenders: ext, rings, baseMm, relaxed: true, noUndercutRings: relaxed ? [...ROUND_NO_UNDERCUT_RINGS] : [] });
    const list = screwFn ? preferOvalScrewFit(strict, screwFn) : strict;
    const p = preferred && list.find((c) => c.ring === preferred.ring && c.extenders.join(",") === preferred.extenders.join(","));
    return p ? [p, ...list.filter((c) => c !== p)] : list;
  }, [depth, ext, rings, baseMm, relaxed, ovalSingle, iloqSingle, preferred?.ring, preferred?.extenders.join(",")]);
  const best = filterByMode(results, mode, screwFn ?? false)[0] ?? results[0];
  useEffect(() => {
    if (mode !== "all" && best && !selected && onSelect) onSelect(best);
  }, [mode, best, selected, onSelect]);
  const chosen = selected ?? best;
  const sel = { chosen, onSelect };
  return (
    <section aria-label={title ? `Resultat ${title.toLowerCase()}` : "Resultat"} className="space-y-3">
      <div className={`sticky top-0 z-10 -mx-1 flex items-center justify-between gap-3 border-b bg-background/95 px-1 pb-3 backdrop-blur ${title === "Insida" ? "border-side-inside" : "border-side-outside"}`}>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          {title && <span className={`flex size-8 items-center justify-center rounded-md ${title === "Insida" ? "bg-side-inside-soft text-side-inside" : "bg-side-outside-soft text-side-outside"}`}>
            {title === "Insida" ? <ArrowDown className="size-4" aria-hidden /> : <ArrowUp className="size-4" aria-hidden />}
          </span>}
          {title ?? "Rekommendation"}
        </h2>
        {depth !== null && <span className="shrink-0 text-xs text-muted-foreground">Dörrdjup <strong className="font-mono text-foreground">{formatMm(depth)}</strong></span>}
      </div>
      {depth === null ? (
        <ol className="grid gap-3 py-2 sm:grid-cols-3">
          {["Välj cylinder", "Ange dörrdjup", "Få kombination och plocklista"].map((s, i) => (
            <li key={s} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-sm font-semibold shadow-card">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent font-mono text-xs font-bold text-accent-foreground">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      ) : !best ? (
        <div className="border-l-2 border-destructive bg-card p-4">
          <p className="font-semibold text-destructive">Ingen lösning {title ? `för ${title.toLowerCase()} ` : ""}med valda lagerstorlekar.</p>
          <p className="mt-1 text-sm text-muted-foreground">Kontrollera tillgängliga förlängare, ringar och dörrdjupet.</p>
        </div>
      ) : (
        <>
          <ResultCard relaxed={relaxed} c={best} best side={title} {...sel} />
          <Alternatives key={`${depth}:${baseMm}:${ext.join(",")}:${rings.join(",")}:${mode}`} mode={mode} screwAware={screwFn ?? false} results={results} best={best} relaxed={relaxed} side={title} {...sel} />
        </>
      )}
    </section>
  );
}

type CardSel = { chosen?: Combination | null | undefined; onSelect?: ((c: Combination) => void) | undefined };
const same = (a?: Combination | null, b?: Combination | null) =>
  !!a && !!b && a.ring === b.ring && a.extenders.join(",") === b.extenders.join(",");

function Alternatives({ results, best, relaxed, side, chosen, onSelect, mode, screwAware = false }: { results: Combination[]; best: Combination; relaxed: boolean; side: string | null; mode: ViewMode; screwAware?: boolean | ScrewFn } & CardSel) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = filterByMode(results, mode, screwAware).filter(c => c !== best);
  const alternatives = shown;
  const forSide = side ? ` för ${side.toLowerCase()}` : "";
  if (alternatives.length === 0) return null;
  void relaxed;
  return (
    <div>
      <Button variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)} className="h-auto min-h-11 w-full justify-between gap-3 px-1 text-foreground hover:bg-muted">
        <span>{open ? `Dölj alternativ${forSide}` : `Visa andra alternativ${forSide}`} <span className="ml-1 font-mono text-xs text-muted-foreground">({alternatives.length})</span></span>
        {open ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
      </Button>
      {open && <div className="space-y-3 pt-2">
        {<>
          <div className="space-y-2">{shown.slice(0, visible).map((c, i) => <ResultCard relaxed={relaxed} key={i} c={c} side={side} chosen={chosen} onSelect={onSelect} />)}</div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">Visar {Math.min(visible, shown.length)} av {shown.length} alternativ{forSide}</p>
            {visible < shown.length && <Button variant="outline" size="sm" onClick={() => setVisible(visible + PAGE_SIZE)}><Plus aria-hidden />Visa fler</Button>}
          </div>
        </>}
      </div>}
    </div>
  );
}

function ResultCard({ c, best = false, side = null, relaxed = false, chosen, onSelect }: { c: Combination; best?: boolean; side?: string | null; relaxed?: boolean } & CardSel) {
  const exact = c.deviation === 0;
  const outsideTolerance = !relaxed && (c.deviation < TOLERANCE_MIN || c.deviation > TOLERANCE_MAX);
  const isChosen = same(c, chosen);
  return (
    <article aria-label={best ? "Bästa rekommendation" : "Alternativ"} className={`rounded-lg border bg-card p-4 ${isChosen && onSelect ? "border-success ring-2 ring-success/30" : best ? "border-primary/30 shadow-card" : "border-border"}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted-foreground">{side ? <SideBadge side={side} /> : !best && <span>Alternativ</span>}{best && <><Check className="size-3.5 text-success" aria-hidden />Bästa passform</>}</p>
        <span className={`rounded-md px-2 py-1 font-mono text-sm font-bold ${outsideTolerance ? "bg-warning-soft text-warning" : exact ? "bg-success-soft text-success" : "bg-muted text-foreground"}`}>{formatSigned(c.deviation)}</span>
      </div>
      <dl className="grid grid-cols-[minmax(70px,0.65fr)_minmax(0,1.6fr)] gap-4">
        <div><dt className="text-xs text-muted-foreground">Ringhöjd</dt><dd className="mt-1 font-mono text-3xl font-bold">{formatMm(c.ring)}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Förlängare · {c.extenderCount} st</dt><dd className="mt-1 flex min-h-9 flex-wrap items-center gap-1.5">{c.extenders.length === 0 ? <span className="text-base font-semibold">Inga förlängare</span> : c.extenders.map((e, i) => <span key={i} className="rounded bg-secondary px-2 py-1 font-mono text-base font-bold">{formatMm(e)}</span>)}</dd><dd className="mt-1 text-xs text-muted-foreground">Totalt <span className="font-mono text-foreground">{formatMm(c.totalExtension)}</span></dd></div>
      </dl>
      <p className={`mt-3 flex items-start gap-1.5 border-t pt-2 text-xs font-medium ${outsideTolerance ? "text-warning" : exact ? "text-success" : "text-muted-foreground"}`}>
        {outsideTolerance && <AlertTriangle className="size-3.5 shrink-0" aria-hidden />}<span>{describeDeviation(c.deviation)}{outsideTolerance && <span className="mt-0.5 block">Utanför toleransen −2 till +2mm (ovala cylindrar).</span>}</span>
      </p>
      {onSelect && (
        <Button variant={isChosen ? "outline" : "secondary"} size="sm" aria-pressed={isChosen} onClick={() => onSelect(c)} className={`mt-3 w-full ${isChosen ? "border-success text-success" : ""}`}>
          {isChosen ? <><Check aria-hidden />Vald för plocklista</> : "Välj för plocklista"}
        </Button>
      )}
    </article>
  );
}
