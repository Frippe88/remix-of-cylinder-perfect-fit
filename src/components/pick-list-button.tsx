import { useState, type ReactNode } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Check, ClipboardCopy, ClipboardList, Disc3, FolderPlus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculate, formatMm, type Combination } from "@/lib/cylinder";
import type { DoorSide } from "@/lib/project";

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
  const parts = [...counts].sort((a, b) => a[0] - b[0]).map(([s, n]) => `${n} st ${formatMm(s)} förlängare`);
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

export function PickListButton({ sides, ext, rings, baseMm, insideBaseMm = baseMm, relaxed, onSave }: {
  sides: PickSide[]; ext: number[]; rings: number[]; baseMm: number; insideBaseMm?: number; relaxed: boolean;
  onSave?: (sides: DoorSide[]) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const picks = sides
    .filter((s) => s.depth !== null)
    .map((s) => ({ label: s.label, depth: s.depth as number, c: s.selected ?? bestFor(s.depth as number, ext, rings, s.label === "Insida" ? insideBaseMm : baseMm, relaxed) }))
    .filter((s): s is { label: string | null; depth: number; c: Combination } => !!s.c);
  if (picks.length === 0) return null;

  const text = picks.map((p) => (p.label ? `${p.label}: ` : "") + pickLine(p.c)).join("\n");
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
                  <span key={s} className="inline-flex items-baseline gap-1.5 rounded-md border border-input bg-muted px-2 py-1 font-mono">
                    <span className="text-xs text-foreground/80">{n} st</span>
                    <span className="text-sm font-bold text-foreground">{formatMm(s)}</span>
                  </span>
                ))
              )}
            </Row>
            <Row caption="Ring" icon={<Disc3 className="size-3.5" />}>
              <span className="inline-flex items-center rounded-md border border-accent/50 bg-accent/10 px-2.5 py-1 font-mono text-sm font-bold text-foreground">
                {formatMm(p.c.ring)}
              </span>
            </Row>
          </li>
        ))}
      </ul>

      <div className="space-y-2 border-t bg-muted/30 px-4 py-3">
        <Button onClick={copy} variant={copied ? "outline" : "default"} className={`min-h-11 w-full font-semibold ${copied ? "border-success text-success" : ""}`}>
          {copied ? <Check aria-hidden /> : <ClipboardCopy aria-hidden />}
          {copied ? "Kopierad!" : "Kopiera plocklista"}
        </Button>
        {onSave && (
          <Button variant="outline" className="min-h-11 w-full font-semibold" onClick={() => onSave(picks.map((p) => ({ label: p.label, depth: p.depth, ring: p.c.ring, extenders: [...p.c.extenders] })))}>
            <FolderPlus aria-hidden /> Spara i projekt
          </Button>
        )}
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
