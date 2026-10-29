// Ren, deterministisk beräkningslogik för Cylinderkalkylator.
export const STANDARD_CYLINDER_MM = 31;
export const ILOQ_CYLINDER_MM = 40;
// iLOQ dubbelcylinder: två 3 mm monteringsbrickor bygger ut cylindern på insidan.
export const ILOQ_DOUBLE_INSIDE_EXTRA_MM = 6;

export const ASSA_S_BRAND = "ASSA ABLOY med S – ring 15mm";
// Vanlig rund ASSA-cylinder utan S i namnet (d12 1211/1212, äldre 4811/4812) – ringar 8/13mm, 33mm med hylsa.
export const ASSA_ROUND_BRAND = "ASSA ABLOY utan S – ring 8 / 13mm";
// S-serien (3211S/3212S) har bara 15 mm ring; justering sker med förlängare.
export const ASSA_S_RING_HEIGHTS = [15] as const;
export function roundRingHeights(brand?: string): number[] {
  return brand === ASSA_S_BRAND ? [...ASSA_S_RING_HEIGHTS] : [...ROUND_RING_HEIGHTS];
}
export function cylinderBaseMm(cyl: "standard" | "round" | "iloq", side: "outside" | "inside", double: boolean, brand?: string): number {
  if (cyl === "round") return brand?.startsWith("ASSA ABLOY") ? ASSA_ROUND_CYLINDER_MM : ROUND_CYLINDER_MM;
  if (cyl === "iloq") return ILOQ_CYLINDER_MM + (double && side === "inside" ? ILOQ_DOUBLE_INSIDE_EXTRA_MM : 0);
  return STANDARD_CYLINDER_MM;
}
export const EXTENDER_SIZES = [8, 10, 12.5] as const;
export const RING_HEIGHTS = [6, 8, 11, 13, 16, 18, 21] as const;
export const ILOQ_RING_HEIGHTS = [27, 30, 33] as const;
export const ROUND_CYLINDER_MM = 31;
// ASSA ABLOY rund: 31mm råcylinder + cylinderhylsa (kopp) = 33mm monterat.
export const ASSA_ROUND_CYLINDER_MM = 33;
export const ROUND_EXTENDER_SIZES = [10] as const;
export const ROUND_RING_HEIGHTS = [8, 13] as const; // endast för runda cylindrar
export const TOLERANCE_MIN = -2;
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
  noUndercutRings?: number[]; // ringar som aldrig får ha negativ avvikelse (cylindern får inte sticka in)
}

/** Rund 8mm ring: stoppskruven når inte godset om cylindern sticker in – endast 0 eller plus. */
export const ROUND_NO_UNDERCUT_RINGS = [8] as const;

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
  const { depth, extenders, rings, baseMm = STANDARD_CYLINDER_MM, relaxed = false, noUndercutRings = [] } = input;
  const noUnder = new Set(noUndercutRings.map(toT));
  if (!Number.isFinite(depth) || depth < 0) return [];
  const sizes = [...new Set(extenders.map(toT))].filter((s) => s > 0).sort((a, b) => b - a);
  const ringT = [...new Set(rings.map(toT))].filter((r) => r > 0);
  if (ringT.length === 0) return [];
  const base = toT(baseMm) - toT(depth);

  // relaxed: hitta alltid bästa möjliga, även om avvikelsen överstiger TOLERANCE_MAX.
  // Öka taket stegvis tills minst en kombination hittas (nedre gräns −2 gäller fortfarande).
  let cap = toT(TOLERANCE_MAX);
  for (;;) {
    const out = calculateWithCap(sizes, ringT, base, cap, noUnder);
    if (out.length > 0 || !relaxed) return out;
    if (cap > toT(200)) return out; // säkerhetsgräns
    cap += toT(2);
  }
}

function calculateWithCap(sizes: number[], ringT: number[], base: number, cap: number, noUnder: Set<number>): Combination[] {
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
      if (dev >= (noUnder.has(r) ? 0 : toT(TOLERANCE_MIN)) && dev <= cap) {
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

export function filterByMode(list: Combination[], mode: ViewMode, screwAware = false): Combination[] {
  if (mode === "exact") return list.filter((c) => c.deviation === 0);
  if (mode === "fewer") {
    if (list.length === 0) return [];
    const exact = list.filter((c) => c.deviation === 0);
    const ref = exact.length ? Math.min(...exact.map((c) => c.extenderCount)) : Infinity;
    const min = Math.min(...list.map((c) => c.extenderCount));
    const limit = ref === Infinity ? min : ref - 1;
    const pool = list.filter((c) => c.extenderCount <= Math.max(limit, min));
    // Samma antal förlängare: välj den där 63mm klippbar skruv räcker före den som kräver speciallängd.
    const screw = (c: Combination) => (screwAware && ovalSingleScrewSet(c.totalExtension).warning ? 1 : 0);
    return [...pool].sort(
      (a, b) =>
        a.extenderCount - b.extenderCount ||
        screw(a) - screw(b) ||
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
  return `${v.toLocaleString("sv-SE", { maximumFractionDigits: 1 })}mm`;
}

export function formatSigned(v: number): string {
  return (v > 0 ? "+" : v < 0 ? "−" : "±") + formatMm(Math.abs(v));
}

// Skruvsatser för runda cylindrar, per fabrikat och totalt antal förlängare (0–3 st).
export const ROUND_SCREW_MAX_EXTENDERS = 3;
export interface ScrewSet { text: string; warning: boolean }
export function roundScrewSet(brand: string | undefined, extenderCount: number): ScrewSet | null {
  if (extenderCount > ROUND_SCREW_MAX_EXTENDERS) return { text: `${extenderCount} st förlängare – ingen färdig skruvsats, kräver speciallängd/klippbara skruv`, warning: true };
  const n = extenderCount * 10;
  if (brand === ASSA_S_BRAND) return { text: `4 st ${66 + n}mm skruv${extenderCount ? ` (3212S:${extenderCount})` : " (3212S)"}`, warning: false };
  if (brand === ASSA_ROUND_BRAND || brand === "dormakaba / DORMA") return { text: `4 st ${60 + n}mm skruv`, warning: false };
  if (brand === "EVVA") return { text: `2 st ${35 + n}mm + 2 st ${60 + n}mm skruv`, warning: false };
  return null;
}

// Skruv för enkel oval cylinder: medbringarbricka + låskista = 21 mm, minst 10 mm gänga i cylindern.
export const OVAL_SCREW_LOCK_MM = 21;
export const OVAL_SCREW_MIN_THREAD_MM = 10;
export const OVAL_SCREW_CLIP_MM = 63;
export const OVAL_SCREW_NOTE = "Skruvlängden räknas med monterad medbringarbricka och minst 10mm skruv in i cylindern.";
export function ovalSingleScrewSet(extenderMm: number): ScrewSet {
  if (extenderMm <= 0) return { text: "2 st 24mm cylinderskruv", warning: false };
  const need = OVAL_SCREW_LOCK_MM + extenderMm + OVAL_SCREW_MIN_THREAD_MM;
  if (need <= OVAL_SCREW_CLIP_MM) return { text: "2 st 63mm klippbar cylinderskruv – kapa till rätt längd", warning: false };
  return { text: `${formatMm(extenderMm)} förlängning – 63mm räcker inte, längre klippbar cylinderskruv krävs (minst ${formatMm(need)})`, warning: true };
}

/** Minsta skruvlängd för enkel oval vid given förlängning. */
export function ovalScrewNeedMm(extenderMm: number): number {
  return OVAL_SCREW_LOCK_MM + extenderMm + OVAL_SCREW_MIN_THREAD_MM;
}

// Skruv för dubbel oval: genom insidans cylinder (~19,5mm) + kista 18,5mm + minst 10mm gänga = 48mm, plus all förlängning (in + ut).
export const OVAL_DOUBLE_SCREW_BASE_MM = 48;
export const OVAL_DOUBLE_SCREW_NOTE = "Skruven går genom insidans cylinder och kistan, och gängas minst 10mm in i utsidans cylinder.";
export function ovalDoubleScrewNeedMm(totalExtMm: number): number {
  return OVAL_DOUBLE_SCREW_BASE_MM + totalExtMm;
}
export function ovalDoubleScrewSet(totalExtMm: number): ScrewSet {
  if (totalExtMm <= 0) return { text: "2 st 48mm cylinderskruv", warning: false };
  const need = ovalDoubleScrewNeedMm(totalExtMm);
  if (need <= OVAL_SCREW_CLIP_MM) return { text: "2 st 63mm klippbar cylinderskruv – kapa till rätt längd", warning: false };
  return { text: `${formatMm(totalExtMm)} förlängning – 63mm räcker inte, längre klippbar cylinderskruv krävs (minst ${formatMm(need)})`, warning: true };
}

/** Dubbel oval: om första paret kräver längre skruv, välj par inom toleransen där 48/63mm räcker (minst total avvikelse). */
export function preferOvalDoublePair(outList: Combination[], inList: Combination[]): [Combination, Combination] | null {
  const a = outList[0], b = inList[0];
  if (!a || !b) return null;
  if (!ovalDoubleScrewSet(a.totalExtension + b.totalExtension).warning) return [a, b];
  const inTol = (c: Combination) => c.deviation >= TOLERANCE_MIN && c.deviation <= TOLERANCE_MAX;
  let best: [Combination, Combination] | null = null, score = Infinity;
  for (const o of outList.filter(inTol)) for (const i of inList.filter(inTol)) {
    if (ovalDoubleScrewSet(o.totalExtension + i.totalExtension).warning) continue;
    const s = Math.abs(o.deviation) + Math.abs(i.deviation);
    if (s < score) { score = s; best = [o, i]; }
  }
  return best ?? [a, b];
}

/** Finns någon kombination inom toleransen där 24/63mm skruv räcker? */
export function hasOvalScrewFit(list: Combination[]): boolean {
  return list.some((c) => c.deviation >= TOLERANCE_MIN && c.deviation <= TOLERANCE_MAX && !ovalSingleScrewSet(c.totalExtension).warning);
}

/** Enkel oval: lägg kombinationer där 24/63mm skruv räcker först (inom toleransen), annars oförändrad ordning. */
export function preferOvalScrewFit(list: Combination[]): Combination[] {
  const ok = (c: Combination) => c.deviation >= TOLERANCE_MIN && c.deviation <= TOLERANCE_MAX && !ovalSingleScrewSet(c.totalExtension).warning;
  return [...list.filter(ok), ...list.filter((c) => !ok(c))];
}
