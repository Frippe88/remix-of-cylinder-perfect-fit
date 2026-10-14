import { useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculate, formatMm, formatSigned, describeDeviation, type Combination } from "@/lib/cylinder";

type Side = { label: string | null; depth: number | null };

function bestFor(depth: number, ext: number[], rings: number[], baseMm: number, relaxed: boolean): Combination | undefined {
  const strict = calculate({ depth, extenders: ext, rings, baseMm, relaxed });
  if (strict.length === 0 && !relaxed) return calculate({ depth, extenders: ext, rings, baseMm, relaxed: true })[0];
  return strict[0];
}

function partLines(c: Combination) {
  const lines = [`• 1 st Ring ${formatMm(c.ring)}`];
  const counts = new Map<number, number>();
  c.extenders.forEach((e) => counts.set(e, (counts.get(e) ?? 0) + 1));
  [...counts].sort((a, b) => a[0] - b[0]).forEach(([s, n]) => lines.push(`• ${n} st Förlängare ${formatMm(s)}`));
  if (c.extenders.length === 0) lines.push("• Inga förlängare");
  return lines;
}

export function PickListButton({ sides, ext, rings, baseMm, relaxed, cylinderName }: {
  sides: Side[]; ext: number[]; rings: number[]; baseMm: number; relaxed: boolean; cylinderName: string;
}) {
  const [copied, setCopied] = useState(false);
  const picks = sides
    .filter((s) => s.depth !== null)
    .map((s) => ({ ...s, best: bestFor(s.depth as number, ext, rings, baseMm, relaxed) }))
    .filter((s): s is Side & { depth: number; best: Combination } => !!s.best);
  if (picks.length === 0) return null;

  const build = () => {
    const out = ["Plocklista – Cylinderkalkylator", `Cylinder: ${cylinderName} (${formatMm(baseMm)})`, ""];
    picks.forEach((p) => {
      out.push(`${p.label ?? "Cylinder"} (dörrdjup ${formatMm(p.depth)}):`, ...partLines(p.best));
      out.push(`Passform: ${formatSigned(p.best.deviation)} – ${describeDeviation(p.best.deviation)}`, "");
    });
    if (picks.length > 1) {
      const rc = new Map<number, number>(), ec = new Map<number, number>();
      picks.forEach((p) => {
        rc.set(p.best.ring, (rc.get(p.best.ring) ?? 0) + 1);
        p.best.extenders.forEach((e) => ec.set(e, (ec.get(e) ?? 0) + 1));
      });
      out.push("Totalt att plocka:");
      [...rc].sort((a, b) => a[0] - b[0]).forEach(([s, n]) => out.push(`• ${n} st Ring ${formatMm(s)}`));
      [...ec].sort((a, b) => a[0] - b[0]).forEach(([s, n]) => out.push(`• ${n} st Förlängare ${formatMm(s)}`));
    }
    return out.join("\n").trim();
  };

  const copy = async () => {
    const text = build();
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
    <Button onClick={copy} variant={copied ? "outline" : "default"} className={`min-h-12 w-full text-base font-semibold ${copied ? "border-success text-success" : ""}`}>
      {copied ? <Check aria-hidden /> : <ClipboardCopy aria-hidden />}
      {copied ? "Kopierad!" : picks.length > 1 ? "Kopiera plocklista (utsida + insida)" : "Kopiera plocklista"}
    </Button>
  );
}
