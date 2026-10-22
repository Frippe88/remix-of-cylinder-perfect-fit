import { formatMm, formatSigned, type Combination } from "@/lib/cylinder";

/** Schematisk genomskärning av montaget. Ren presentation – all matte kommer från cylinder.ts. */
export function MountDiagram({ c, depth, baseMm, warn }: { c: Combination; depth: number; baseMm: number; warn: boolean }) {
  const W = 560, H = 150, x0 = 40, y = 50, h = 50;
  const cylLen = baseMm + c.totalExtension;
  const ringFace = depth + c.ring;
  const span = Math.max(cylLen, ringFace) + 6;
  const k = (W - x0 - 30) / span;
  const X = (mm: number) => x0 + mm * k;
  const segs: { from: number; to: number; label: string; cls: string }[] = [];
  segs.push({ from: 0, to: baseMm, label: `Cylinder ${formatMm(baseMm)}`, cls: "fill-primary" });
  let acc = baseMm;
  c.extenders.forEach((e) => { segs.push({ from: acc, to: acc + e, label: formatMm(e), cls: "fill-accent" }); acc += e; });
  const tone = warn ? "text-warning" : c.deviation === 0 ? "text-success" : "text-foreground";

  return (
    <figure className="mt-3 rounded-lg border bg-muted/40 p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Montage: dörrdjup ${formatMm(depth)}, ring ${formatMm(c.ring)}, avvikelse ${formatSigned(c.deviation)}`}>
        {/* Låshus */}
        <rect x={x0 - 30} y={y - 20} width={30} height={h + 40} rx={3} className="fill-muted-foreground/40" />
        <text x={x0 - 15} y={y + h + 36} textAnchor="middle" className="fill-muted-foreground text-[10px]">Låshus</text>
        {/* Dörrblad */}
        <rect x={x0} y={y - 20} width={depth * k} height={h + 40} className="fill-muted-foreground/15" />
        {/* Ring */}
        <rect x={X(depth)} y={y - 12} width={c.ring * k} height={h + 24} rx={3} className="fill-secondary stroke-border" />
        {/* Cylinder + förlängare */}
        {segs.map((s, i) => (
          <g key={i}>
            <rect x={X(s.from)} y={y} width={(s.to - s.from) * k - 1} height={h} rx={2} className={s.cls} />
            {(s.to - s.from) * k > 34 && (
              <text x={X((s.from + s.to) / 2)} y={y + h / 2 + 4} textAnchor="middle" className={`font-mono text-[10px] font-bold ${i === 0 ? "fill-primary-foreground" : "fill-accent-foreground"}`}>{s.label}</text>
            )}
          </g>
        ))}
        {/* Dörryta och ringyta */}
        <line x1={X(depth)} x2={X(depth)} y1={y - 28} y2={y + h + 28} strokeDasharray="3 3" className="stroke-muted-foreground" />
        <text x={X(depth)} y={y - 32} textAnchor="middle" className="fill-muted-foreground text-[10px]">Dörryta</text>
        <line x1={X(ringFace)} x2={X(ringFace)} y1={y - 28} y2={y + h + 28} strokeWidth={2} className={warn ? "stroke-warning" : "stroke-success"} />
        <text x={X(ringFace)} y={y + h + 40} textAnchor="middle" className="fill-muted-foreground text-[10px]">Ring {formatMm(c.ring)}</text>
      </svg>
      <figcaption className={`mt-1 flex flex-wrap justify-between gap-2 text-xs font-semibold ${tone}`}>
        <span>Cylinder + förlängare: <span className="font-mono">{formatMm(cylLen)}</span></span>
        <span>Utstick mot ring: <span className="font-mono">{formatSigned(c.deviation)}</span></span>
      </figcaption>
    </figure>
  );
}
