import { useState, type ReactNode } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Check, CircleHelp, ClipboardCopy, ClipboardList, Disc3, FolderOpen, FolderPlus, Layers, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ROUND_NO_UNDERCUT_RINGS, calculate, preferOvalScrewFit, roundScrewSet, ovalSingleScrewSet, OVAL_SCREW_NOTE, describeDeviation, formatMm, formatSigned, type Combination } from "@/lib/cylinder";
import { FITTING_LABEL, fittingForSide, fittingRingText, isLooseFitting, ringName, type DoorSide, type Fitting } from "@/lib/project";

export type PickSide = { label: string | null; depth: number | null; selected: Combination | null };

export const sameCombo = (a: Combination | null | undefined, b: Combination | null | undefined) =>
  !!a && !!b && a.ring === b.ring && a.extenders.join(",") === b.extenders.join(",");

function bestFor(depth: number, ext: number[], rings: number[], baseMm: number, relaxed: boolean, oval = false): Combination | undefined {
  const strict = calculate({ depth, extenders: ext, rings, baseMm, relaxed, noUndercutRings: relaxed ? [...ROUND_NO_UNDERCUT_RINGS] : [] });
  if (strict.length === 0 && !relaxed) return calculate({ depth, extenders: ext, rings, baseMm, relaxed: true, noUndercutRings: relaxed ? [...ROUND_NO_UNDERCUT_RINGS] : [] })[0];
  return (oval ? preferOvalScrewFit(strict) : strict)[0];
}

/** Texten som kopieras – håll den ren, den klistras in i SMS/WhatsApp/order. */
export function pickLine(c: Combination, fitting?: Fitting | null, inner = false) {
  const counts = new Map<number, number>();
  c.extenders.forEach((e) => counts.set(e, (counts.get(e) ?? 0) + 1));
  const ext = [...counts].sort((a, b) => a[0] - b[0]).map(([s, n]) => `${n}st ${formatMm(s)} förlängare`);
  return [fitting ? fittingRingText(fitting, c.ring, inner) : ringName(c.ring, inner), ...ext].join(" + ");
}

function grouped(c: Combination) {
  const counts = new Map<number, number>();
  c.extenders.forEach((e) => counts.set(e, (counts.get(e) ?? 0) + 1));
  return [...counts].sort((a, b) => a[0] - b[0]);
}

function SideTag({ label }: { label: string | null }) {
  if (!label)
    return (
      <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        Cylinder
      </span>
    );
  const inside = label === "Insida";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
        inside ? "bg-side-inside-soft text-side-inside" : "bg-side-outside-soft text-side-outside"
      }`}
    >
      {inside ? <ArrowDown className="size-3" aria-hidden /> : <ArrowUp className="size-3" aria-hidden />}
      {label}
    </span>
  );
}

export function sideChip(label: string | null) {
  if (label === "Insida") return "border-side-inside/30 bg-side-inside-soft text-side-inside";
  if (label === "Utsida") return "border-side-outside/30 bg-side-outside-soft text-side-outside";
  return null;
}

function Row({ caption, icon, children }: { caption: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,88px)_minmax(0,1fr)] items-center gap-x-3 gap-y-1 sm:grid-cols-[minmax(0,96px)_minmax(0,1fr)]">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
        <span className="text-foreground/50" aria-hidden>{icon}</span>
        {caption}
      </span>
      <span className="flex flex-wrap items-center gap-1.5">{children}</span>
    </div>
  );
}

const FITTING_MENU: Record<Fitting, string> = {
  vred: "Vred med cylinder",
  tackbricka: "Täckbricka med cylinder",
  "256": "256 behör (vred)",
  "2356": "2356 behör (täckbricka)",
  "3212": "3212 behör (ASSA rund cylinder)",
  "18256": "18256 behör (dubbel oval cylinder)",
  "DAK 7200": "DAK 7200 behör (dormakaba vred)",
  "DAK 7101": "DAK 7101 behör (dormakaba täckbricka)",
  "DAK 752": "DAK 752 behör (dormakaba rund cylinder)",
  "A10.11": "A10.11 monteringskit (iLOQ dubbelcylinder)",
};

export function PickListButton({ sides, ext, rings, insideRings = rings, insideExt = ext, baseMm, insideBaseMm = baseMm, relaxed, onSave, projectName, projectDoors = 0, projectCount = 1, onOpenProject, fitting = null, onFittingChange, fittingChoices = ["256", "2356"], iloqDouble = false, screwBrand, ovalSingle = false, onShowAll }: {
  sides: PickSide[]; ext: number[]; rings: number[]; insideRings?: number[]; insideExt?: number[]; baseMm: number; insideBaseMm?: number; relaxed: boolean;
  onSave?: ((sides: DoorSide[]) => void) | undefined;
  projectName?: string; projectDoors?: number; projectCount?: number; onOpenProject?: () => void;
  fitting?: Fitting | null; onFittingChange?: ((value: Fitting | null) => void) | undefined;
  fittingChoices?: Fitting[]; iloqDouble?: boolean; screwBrand?: string | undefined; ovalSingle?: boolean; onShowAll?: (() => void) | undefined;
}) {
  const savedTo = (projectName ?? "").trim();
  const projectLabel = savedTo || "Projekt";
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const picks = sides
    .filter((s) => s.depth !== null)
    .map((s) => ({ label: s.label, depth: s.depth as number, c: s.selected ?? (s.label === "Insida" ? bestFor(s.depth as number, insideExt, insideRings, insideBaseMm, relaxed) : bestFor(s.depth as number, ext, rings, baseMm, relaxed, !!ovalSingle && sides.length < 2)) }))
    .filter((s): s is { label: string | null; depth: number; c: Combination } => !!s.c);
  if (picks.length === 0) return null;

  const isInner = (label: string | null) => iloqDouble && label === "Insida";
  const ovalScrew = ovalSingle && sides.length < 2 && picks[0] ? ovalSingleScrewSet(picks[0].c.extenders.reduce((a, b) => a + b, 0)) : null;
  const screws = ovalScrew ?? (!screwBrand ? null
    : sides.length < 2 ? { text: "Beror på montage – kalkylatorn kan inte ange exakt skruvlängd vid enkelcylinder.", warning: false }
    : roundScrewSet(screwBrand, picks.reduce((n, p) => n + p.c.extenderCount, 0)));
  const text = picks.map((p) => (p.label ? `${p.label}: ` : "") + pickLine(p.c, fittingForSide(fitting, p.label), isInner(p.label))).join("\n") + (screws ? `\nSkruv: ${screws.text}` : "") + (ovalScrew ? `\n(${OVAL_SCREW_NOTE})` : "");
  const insidePick = picks.find((p) => isInner(p.label));
  const menuText = (f: Fitting) => (f === "vred" || f === "tackbricka") && picks[0] ? fittingRingText(f, picks[0].c.ring)
    : f === "A10.11" && insidePick ? `A10.11 monteringskit (${ringName(insidePick.c.ring, true)} insida)`
    : (f === "256" || f === "2356") && picks[0] ? `${FITTING_MENU[f]} – ${isLooseFitting(f, picks[0].c.ring) ? `lös ring ${formatMm(picks[0].c.ring)}` : ringName(picks[0].c.ring)}` : FITTING_MENU[f];
  const parts = picks.reduce((n, p) => n + p.c.extenderCount + 1, 0);

  const copy = async () => {
    setFailed(false);
    let ok = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "0";
        ta.style.left = "0";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setFailed(true);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-card" aria-label="Plocklista">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/50 px-4 py-2.5">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
          <ClipboardList className="size-4 shrink-0 text-accent" aria-hidden />
          Plocklista
        </p>
        <span className="shrink-0 rounded-full border border-input bg-card px-2 py-0.5 font-mono text-[11px] font-bold text-foreground/90">
          {parts} {parts === 1 ? "del" : "delar"}
        </span>
      </div>

      {projectCount > 1 && (
        <div className="flex items-center justify-between gap-2 border-b border-accent/30 bg-accent/10 px-4 py-1.5">
          <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold">
            <FolderOpen className="size-3.5 shrink-0 text-accent" aria-hidden />
            <span className="shrink-0 text-muted-foreground">Sparas i</span>
            <span className="truncate font-bold text-foreground">{projectLabel}</span>
            <span className="shrink-0 text-muted-foreground">· {projectDoors} {projectDoors === 1 ? "dörr" : "dörrar"}</span>
          </span>
          {onOpenProject && (
            <Button variant="ghost" size="sm" onClick={onOpenProject} className="h-7 shrink-0 px-2 text-xs font-bold text-accent hover:bg-accent/15">
              Byt projekt
            </Button>
          )}
        </div>
      )}

      <ul className="divide-y divide-border">
        {picks.map((p, i) => (
          <li key={`${p.label ?? "cyl"}:${i}`} className="space-y-2.5 px-4 py-3.5">
            <div className="flex items-center justify-between gap-2">
              <SideTag label={p.label} />
              <span className="shrink-0 font-mono text-xs text-foreground/90">dörrdjup {formatMm(p.depth)}</span>
            </div>
            <Row caption="Förlängare" icon={<Layers className="size-3.5" />}>
              {p.c.extenders.length === 0 ? (
                <span className="text-sm font-semibold text-muted-foreground">Inga förlängare</span>
              ) : (
                grouped(p.c).map(([s, n]) => (
                  <span key={s} className={`inline-flex items-baseline gap-1.5 rounded-md border px-2 py-1 font-mono ${sideChip(p.label) ?? "border-input bg-muted"}`}>
                    <span className="text-xs opacity-70">{n} st</span>
                    <span className="text-sm font-bold">{formatMm(s)}</span>
                  </span>
                ))
              )}
            </Row>
            <Row caption="Ring" icon={<Disc3 className="size-3.5" />}>
              <span className={`inline-flex items-center rounded-md border px-2.5 py-1 font-mono text-sm font-bold ${sideChip(p.label) ?? "border-accent/50 bg-accent/10 text-foreground"}`}>
                {formatMm(p.c.ring)}
              </span>
              {isInner(p.label) && <span className="text-xs font-semibold text-foreground">iLOQ innerring (med skruvhål)</span>}
            </Row>
            <Row caption="Utstick" icon={p.c.deviation === 0 ? <Check className="size-3.5" /> : p.c.deviation > 0 ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}>
              <span className={`inline-flex items-center rounded-md px-2 py-1 font-mono text-sm font-bold ${p.c.deviation === 0 ? "bg-success-soft text-success" : "bg-muted text-foreground"}`}>{formatSigned(p.c.deviation)}</span>
              <span className="text-xs font-medium text-foreground/80">{describeDeviation(p.c.deviation)}</span>
            </Row>
            {(() => {
              const sideFit = fittingForSide(fitting, p.label);
              return sideFit ? (
                <Row caption="Behör" icon={<Wrench className="size-3.5" />}>
                  <span className="inline-flex items-center rounded-md border border-accent/50 bg-accent/10 px-2.5 py-1 text-sm font-bold text-foreground">
                    {FITTING_LABEL[sideFit]}
                  </span>
                </Row>
              ) : null;
            })()}
          </li>
        ))}
        {screws && (
          <li className="px-4 py-3">
            <Row caption="Skruv" icon={screws.warning ? <AlertTriangle className="size-3.5 text-destructive" /> : <Wrench className="size-3.5" />}>
              {ovalScrew?.warning ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-destructive/50 bg-destructive/10 px-2 py-1 text-sm font-bold text-destructive">63mm räcker inte</span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-input bg-muted px-2.5 py-1 text-sm font-bold text-foreground">
                  {screws.text}
                </span>
              )}
            </Row>
            {ovalScrew?.warning && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" aria-label="Förklara varför 63mm inte räcker" className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-side-outside px-2.5 py-1 text-sm font-bold text-side-outside-soft active:scale-95">
                      <CircleHelp className="size-4 shrink-0" aria-hidden />
                      Varför?
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 space-y-2 text-sm">
                    <p className="font-bold">Varför räcker inte 63mm?</p>
                    <p>63mm skruv klarar max 32mm förlängare (kista + bricka = 21mm, gänga = 10mm). Den här kombinationen behöver mer förlängning än så.</p>
                    <p>Välj läget <strong>Alla</strong> för att få ett godkänt förslag (inom ±2mm) där standard 63mm räcker.</p>
                    {onShowAll && <Button size="sm" className="w-full" onClick={onShowAll}>Byt till Alla</Button>}
                    <p className="border-t border-border pt-2 text-xs text-muted-foreground">{OVAL_SCREW_NOTE}</p>
                  </PopoverContent>
                </Popover>
                {onShowAll && (
                  <Button size="sm" variant="outline" className="min-h-9" onClick={onShowAll}>
                    Byt till Alla
                  </Button>
                )}
              </div>
            )}
          </li>
        )}
      </ul>

      <div className="space-y-2 border-t bg-muted/30 px-4 py-3">
        {onFittingChange && (
          <label className="block pb-2 text-sm font-semibold">
            Behör <span className="text-xs font-normal text-muted-foreground">(valfritt)</span>
            <select aria-label="Behör" value={fitting ?? ""} onChange={(e) => onFittingChange(fittingChoices.includes(e.target.value as Fitting) ? (e.target.value as Fitting) : null)}
              className="mt-1.5 min-h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-base font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Inget behör valt</option>
              {fittingChoices.map((f) => (
                <option key={f} value={f}>{menuText(f)}</option>
              ))}
            </select>
            <span className="mt-2 block rounded-md border border-border bg-muted px-3 py-2 text-sm font-normal leading-snug text-foreground">Vi räknar med <strong className="font-bold">ASSA ABLOY:s behör (256, 2356, 18256)</strong>. Annat fabrikat? Byt bara ut behöret mot motsvarande – <strong className="font-bold">ringhöjden är densamma</strong>.</span>
          </label>
        )}
        {onSave && (
          <Button variant="outline" className="min-h-11 w-full justify-start gap-2 font-semibold" onClick={() => onSave(picks.map((p) => ({ label: p.label, depth: p.depth, ring: p.c.ring, extenders: [...p.c.extenders] })))}>
            <FolderPlus aria-hidden className="shrink-0" />
            <span className="truncate">Spara i {savedTo ? `”${savedTo}”` : "projekt"}</span>
          </Button>
        )}
        <Button onClick={copy} variant={copied ? "outline" : "default"} className={`min-h-11 w-full font-semibold ${copied ? "border-success text-success" : ""}`}>
          {copied ? <Check aria-hidden /> : <ClipboardCopy aria-hidden />}
          {copied ? "Kopierad!" : "Kopiera plocklista"}
        </Button>
        {failed ? (
          <p className="flex items-start gap-1.5 text-xs font-medium text-warning">
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
            <span>Kunde inte kopiera automatiskt. Markera listan och kopiera själv.</span>
          </p>
        ) : (
          <p className="text-xs text-foreground/75">Tryck ”Välj för plocklista” på ett annat alternativ för att byta.</p>
        )}
      </div>
    </div>
  );
}
