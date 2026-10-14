// Ren, deterministisk beräkningslogik för Cylinderkalkylator.
export const STANDARD_CYLINDER_MM = 31;
export const ILOQ_CYLINDER_MM = 40;
export const EXTENDER_SIZES = [8, 10, 12.5] as const;
export const RING_HEIGHTS = [6, 8, 11, 13, 16, 18, 21] as const;
export const ILOQ_RING_HEIGHTS = [27, 30, 33] as const;
export const ROUND_CYLINDER_MM = 30;
export const ROUND_EXTENDER_SIZES = [10] as const;
export const ROUND_RING_HEIGHTS = [8, 13] as const; // endast för runda cylindrar
export const TOLERANCE_MIN = -1;
export const TOLERANCE_MAX = 2;

export interface Combination {
  ring: number;
  extenders: number[]; // varje förlängares storlek, sorterad fallande
  extenderCount: number;
  totalExtension: number;
  deviation: number;
}

export interface CalcInput {
  depth: number;
  extenders: number[];
  rings: number[];
  baseMm?: number; // cylinderlängd, standard 31 mm (iLOQ 40 mm)
  relaxed?: boolean; // true = ge alltid bästa resultat även utanför toleransen (rund cylinder)
}

// Arbeta i tiondels millimeter för att undvika flyttalsfel.
const toT = (mm: number) => Math.round(mm * 10);
const fromT = (t: number) => t / 10;

export function deviationOf(depth: number, totalExtension: number, ring: number, baseMm = STANDARD_CYLINDER_MM): number {
  return fromT(toT(baseMm) + toT(totalExtension) - toT(depth) - toT(ring));
}

export function compareCombinations(a: Combination, b: Combination): number {
  const az = a.deviation === 0 ? 0 : 1;
  const bz = b.deviation === 0 ? 0 : 1;
  if (az !== bz) return az - bz;
  const ad = Math.abs(a.deviation) - Math.abs(b.deviation);
  if (ad !== 0) return ad;
  if (a.extenderCount !== b.extenderCount) return a.extenderCount - b.extenderCount;
  if (a.ring !== b.ring) return a.ring - b.ring;
  return a.extenders.join(",").localeCompare(b.extenders.join(","));
}

export function calculate(input: CalcInput): Combination[] {
  const { depth, extenders, rings, baseMm = STANDARD_CYLINDER_MM, relaxed = false } = input;
  if (!Number.isFinite(depth) || depth < 0) return [];
  const sizes = [...new Set(extenders.map(toT))].filter((s) => s > 0).sort((a, b) => b - a);
  const ringT = [...new Set(rings.map(toT))].filter((r) => r > 0);
  if (ringT.length === 0) return [];
  const base = toT(baseMm) - toT(depth);

  // relaxed: hitta alltid bästa möjliga, även om avvikelsen överstiger TOLERANCE_MAX.
  // Öka taket stegvis tills minst en kombination hittas (nedre gräns −1 gäller fortfarande).
  let cap = toT(TOLERANCE_MAX);
  for (;;) {
    const out = calculateWithCap(sizes, ringT, base, cap);
    if (out.length > 0 || !relaxed) return out;
    if (cap > toT(200)) return out; // säkerhetsgräns
    cap += toT(2);
  }
}

function calculateWithCap(sizes: number[], ringT: number[], base: number, cap: number): Combination[] {
  const maxExt = Math.max(...ringT) + cap - base;
  if (maxExt < 0) return [];

  // Alla multimängder av förlängare med total längd <= maxExt.
  const sets: number[][] = [];
  const walk = (i: number, remaining: number, cur: number[]) => {
    if (i === sizes.length) {
      sets.push([...cur]);
      return;
    }
    for (let n = 0; n * sizes[i]! <= remaining; n++) {
      const s = sizes[i]!;
      for (let k = 0; k < n; k++) cur.push(s);
      walk(i + 1, remaining - n * s, cur);
      for (let k = 0; k < n; k++) cur.pop();
    }
  };
  walk(0, maxExt, []);

  const out: Combination[] = [];
  for (const set of sets) {
    const total = set.reduce((s, x) => s + x, 0);
    for (const r of ringT) {
      const dev = base + total - r;
      if (dev >= toT(TOLERANCE_MIN) && dev <= cap) {
        out.push({
          ring: fromT(r),
          extenders: set.map(fromT),
          extenderCount: set.length,
          totalExtension: fromT(total),
          deviation: fromT(dev),
        });
      }
    }
  }
  return out.sort(compareCombinations);
}

export type ViewMode = "exact" | "all" | "fewer";

export function filterByMode(list: Combination[], mode: ViewMode): Combination[] {
  if (mode === "exact") return list.filter((c) => c.deviation === 0);
  if (mode === "fewer") {
    if (list.length === 0) return [];
    const exact = list.filter((c) => c.deviation === 0);
    const ref = exact.length ? Math.min(...exact.map((c) => c.extenderCount)) : Infinity;
    const min = Math.min(...list.map((c) => c.extenderCount));
    const limit = ref === Infinity ? min : ref - 1;
    const pool = list.filter((c) => c.extenderCount <= Math.max(limit, min));
    return [...pool].sort(
      (a, b) =>
        a.extenderCount - b.extenderCount ||
        Math.abs(a.deviation) - Math.abs(b.deviation) ||
        compareCombinations(a, b),
    );
  }
  return list;
}

export function describeDeviation(d: number): string {
  if (d === 0) return "Exakt i liv med ringen";
  if (d > 0) return `Sticker ut ${formatMm(d)}`;
  return `${formatMm(-d)} innanför ringen`;
}

export function formatMm(v: number): string {
  return `${v.toLocaleString("sv-SE", { maximumFractionDigits: 1 })} mm`;
}

export function formatSigned(v: number): string {
  return (v > 0 ? "+" : v < 0 ? "−" : "±") + formatMm(Math.abs(v));
}
