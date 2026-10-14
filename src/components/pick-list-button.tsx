import { useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculate, formatMm, type Combination } from "@/lib/cylinder";

export type PickSide = { label: string | null; depth: number | null; selected: Combination | null };

export const sameCombo = (a: Combination | null | undefined, b: Combination | null | undefined) =>
  !!a && !!b && a.ring === b.ring && a.extenders.join(",") === b.extenders.join(",");

function bestFor(depth: number, ext: number[], rings: number[], baseMm: number, relaxed: boolean): Combination | undefined {
  const strict = calculate({ depth, extenders: ext, rings, baseMm, relaxed });
  if (strict.length === 0 && !relaxed) return calculate({ depth, extenders: ext, rings, baseMm, relaxed: true })[0];
  return strict[0];
}

export function pickLine(c: Combination) {
  const counts = new Map<number, number>();
  c.extenders.forEach((e) => counts.set(e, (counts.get(e) ?? 0) + 1));
  const parts = [...counts].sort((a, b) => a[0] - b[0]).map(([s, n]) => `${n} st ${formatMm(s)} förlängare`);
  parts.push(`${formatMm(c.ring)} ring`);
  return parts.join(" + ");
}

export function PickListButton({ sides, ext, rings, baseMm, relaxed }: {
  sides: PickSide[]; ext: number[]; rings: number[]; baseMm: number; relaxed: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const picks = sides
    .filter((s) => s.depth !== null)
    .map((s) => ({ label: s.label, c: s.selected ?? bestFor(s.depth as number, ext, rings, baseMm, relaxed) }))
    .filter((s): s is { label: string | null; c: Combination } => !!s.c);
  if (picks.length === 0) return null;

  const text = picks.map((p) => (p.label ? `${p.label}: ` : "") + pickLine(p.c)).join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plocklista</p>
      <pre className="whitespace-pre-wrap font-mono text-sm font-semibold text-foreground">{text}</pre>
      <Button onClick={copy} variant={copied ? "outline" : "default"} className={`min-h-11 w-full font-semibold ${copied ? "border-success text-success" : ""}`}>
        {copied ? <Check aria-hidden /> : <ClipboardCopy aria-hidden />}
        {copied ? "Kopierad!" : "Kopiera plocklista"}
      </Button>
      <p className="text-xs text-muted-foreground">Tryck ”Välj” på ett annat alternativ för att byta.</p>
    </div>
  );
}
