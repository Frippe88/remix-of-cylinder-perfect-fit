import { useState, type ReactNode } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Check, ClipboardCopy, ClipboardList, Disc3, FolderOpen, FolderPlus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculate, formatMm, type Combination } from "@/lib/cylinder";
import { FITTING_LABEL, type DoorSide, type Fitting } from "@/lib/project";

export type PickSide = { label: string | null; depth: number | null; selected: Combination | null };

export const sameCombo = (a: Combination | null | undefined, b: Combination | null | undefined) =>
  !!a && !!b && a.ring === b.ring && a.extenders.join(",") === b.extenders.join(",");

function bestFor(depth: number, ext: number[], rings: number[], baseMm: number, relaxed: boolean): Combination | undefined {
  const strict = calculate({ depth, extenders: ext, rings, baseMm, relaxed });
  if (strict.length === 0 && !relaxed) return calculate({ depth, extenders: ext, rings, baseMm, relaxed: true })[0];
  return strict[0];
}

/** Texten som kopieras – håll den ren, den klistras in i SMS/WhatsApp/order. */
export function pickLine(c: Combination) {
  const counts = new Map<number, number>();
  c.extenders.forEach((e) => counts.set(e, (counts.get(e) ?? 0) + 1));
  const parts = [...counts].sort((a, b) => a[0] - b[0]).map(([s, n]) => `${n}st ${formatMm(s)} förlängare`);
  parts.push(`${formatMm(c.ring)} ring`);
  return parts.join(" + ");
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

export function PickListButton({ sides, ext, rings, baseMm, insideBaseMm = baseMm, relaxed, onSave, projectName, projectDoors = 0, projectCount = 1, onOpenProject, fitting = null, onFittingChange }: {
  sides: PickSide[]; ext: number[]; rings: number[]; baseMm: number; insideBaseMm?: number; relaxed: boolean;
  onSave?: ((sides: DoorSide[]) => void) | undefined;
  projectName?: string; projectDoors?: number; projectCount?: number; onOpenProject?: () => void;
  fitting?: Fitting | null; onFittingChange?: ((value: Fitting | null) => void) | undefined;
}) {
  const savedTo = (projectName ?? "").trim();
  const projectLabel = savedTo || "Projekt";
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const picks = sides
    .filter((s) => s.depth !== null)
    .map((s) => ({ label: s.label, depth: s.depth as number, c: s.selected ?? bestFor(s.depth as number, ext, rings, s.label === "Insida" ? insideBaseMm : baseMm, relaxed) }))
    .filter((s): s is { label: string | null; depth: number; c: Combination } => !!s.c);
  if (picks.length === 0) return null;

  const text = [...picks.map((p) => (p.label ? `${p.label}: ` : "") + pickLine(p.c)), ...(fitting ? [FITTING_LABEL[fitting]] : [])].join("\n");
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
            </Row>
          </li>
        ))}
      </ul>

      <div className="space-y-2 border-t bg-muted/30 px-4 py-3">
        {onSave && (
          <Button variant="outline" className="min-h-11 w-full justify-start gap-2 font-semibold" onClick={() => onSave(picks.map((p) => ({ label: p.label, depth: p.depth, ring: p.c.ring, extenders: [...p.c.extenders] })))}>
            <FolderPlus aria-hidden className="shrink-0" />
            <span className="truncate">Spara i {savedTo ? `”${savedTo}”` : "projekt"}</span>
          </Button>
        )}
        {onFittingChange && (
          <label className="block py-2 text-sm font-semibold">
            Behör <span className="text-xs font-normal text-muted-foreground">(valfritt)</span>
            <select aria-label="Behör" value={fitting ?? ""} onChange={(e) => onFittingChange(e.target.value === "256" || e.target.value === "2356" ? e.target.value : null)}
              className="mt-1.5 min-h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-base font-normal text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Inget behör valt</option>
              <option value="256">256 behör (vred)</option>
              <option value="2356">2356 behör (täckbricka)</option>
            </select>
          </label>
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
