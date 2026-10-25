// Projekt med flera dörrar – ren logik (lagring sköts i UI via localStorage).
import { formatMm } from "./cylinder";

export type RingKind = "oval" | "rund" | "iloq";
export type Fitting = "vred" | "tackbricka" | "256" | "2356" | "3212" | "18256" | "DAK 7200" | "DAK 7101" | "DAK 752" | "A10.11";
export const FITTING_LABEL: Record<Fitting, string> = {
  vred: "Vred med cylinder", tackbricka: "Täckbricka med cylinder",
  "256": "256 behör", "2356": "2356 behör", "3212": "3212 behör", "18256": "18256 behör",
  "DAK 7200": "DAK 7200 behör", "DAK 7101": "DAK 7101 behör", "DAK 752": "DAK 752 behör",
  "A10.11": "A10.11 monteringskit",
};
/** iLOQ dubbelcylinder: insidan kräver iLOQs egen innerring (skruvhål för genomgående skruv). */
export function isIloqInner(kind: RingKind | undefined, label: string | null | undefined, double: boolean): boolean {
  return double && kind === "iloq" && label === "Insida";
}
export function ringName(ring: number, inner = false): string {
  return `${formatMm(ring)} ${inner ? "iLOQ innerring" : "ring"}`;
}
/** Gäller behöret just den här sidan? A10.11 hör till insidan; övriga behör till alla sidor. */
export function fittingForSide(fitting: Fitting | null | undefined, label: string | null | undefined): Fitting | null {
  if (!fitting) return null;
  if (fitting === "A10.11") return label === "Insida" ? fitting : null;
  return fitting;
}
/** Färdiga 256/2356-satser finns bara med 6–21 mm ring; högre ring = plocka själv. */
export const FITTING_KIT_MAX_RING = 21;
export function isLooseFitting(fitting: Fitting | null | undefined, ring: number): boolean {
  return (fitting === "256" || fitting === "2356") && ring > FITTING_KIT_MAX_RING;
}
export function looseFittingLabel(fitting: Fitting): string {
  return `${FITTING_LABEL[fitting]}, lös ring`;
}
/** Behalls för äldre anrop; slår ihop namn och ring utan dubbel "med". */
export function withRing(name: string, ring: string): string {
  return /\bmed\b/i.test(name) ? `${name} ${ring}` : `${name} med ${ring}`;
}
/** Ett behör + ring som en beställningsrad: "256 behör (11mm ring)", över 21 mm "256 behör (lös ring 24mm)". */
export function fittingRingText(fitting: Fitting, ring: number, inner = false): string {
  if (isLooseFitting(fitting, ring)) return `${FITTING_LABEL[fitting]} (lös ring ${formatMm(ring)})`;
  return `${FITTING_LABEL[fitting]} (${ringName(ring, inner || fitting === "A10.11")})`;
}
/** Vilka behör som kan väljas för given cylinder. Tom lista = inget behörsval. */
export function fittingOptions(variant: "free" | "pro", cylinder: "standard" | "round" | "iloq", type: "single" | "double", _brand?: string): Fitting[] {
  if (variant !== "pro") return [];
  // Runda cylindrar: inget behörsval – bara ringar och förlängare per sida.
  if (cylinder === "round") return [];
  if (type === "double") return cylinder === "standard" ? ["18256"] : ["A10.11"];
  // Enkelcylinder: 256 (vred) eller 2356 (täckbricka) – det chefen beställer per ringhöjd.
  return ["256", "2356"];
}
export function canSelectFitting(variant: "free" | "pro", cylinder: "standard" | "round" | "iloq", type: "single" | "double", brand?: string): boolean {
  return fittingOptions(variant, cylinder, type, brand).length > 0;
}
export interface DoorSide { label: string | null; depth: number; ring: number; extenders: number[] }
export interface Door { id: string; name: string; kind: RingKind; done: boolean; sides: DoorSide[]; fitting?: Fitting }
export interface Project { name: string; doors: Door[] }

export const KIND_LABEL: Record<RingKind, string> = { oval: "oval", rund: "rund", iloq: "iLOQ" };

// Alla cylindertyper redovisas per sida (utsida/insida).
export const RING_HAS_SIDE: Record<RingKind, boolean> = { oval: true, rund: true, iloq: true };

export function nextDoorName(doors: Door[]): string {
  let n = doors.length + 1;
  const names = new Set(doors.map((d) => d.name));
  while (names.has(`Dörr ${n}`)) n++;
  return `Dörr ${n}`;
}

/** Sätter sida på en dörrs rader. Runda cylindrar har samma ring ute som inne – de får ingen sida. */
export function setDoorSide(door: Door, sideIndex: number, label: string | null): Door {
  if (!RING_HAS_SIDE[door.kind]) return door;
  return { ...door, sides: door.sides.map((s, i) => (i === sideIndex ? { ...s, label } : s)) };
}

export interface Totals {
  extenders: { size: number; kind: RingKind; count: number }[];
  rings: { size: number; kind: RingKind; side: string; inner: boolean; count: number }[];
  fittings: { fitting: Fitting; size: number; kind: RingKind; side: string; inner: boolean; count: number }[];
  /** Monteringskit utan ring i satsen (A10.11) – ringarna räknas som lösa ringar. */
  kits: { fitting: Fitting; count: number }[];
  /** 256/2356 med ring högre än färdig sats: plockas själv, ringen står på samma rad. */
  loose: Totals["fittings"];
  /** Antal dörrar med dubbelcylinder. */
  doubles: number;
  /** iLOQ dubbelcylinder: ringpar per dörr (utsida + iLOQ innerring insida), räknas inte under lösa ringar. */
  iloqPairs: { outer: number; inner: number; count: number }[];
  /** Kompletta dubbelpaket (18256): ett paket per dörr med ring utsida + insida. */
  setPairs: { fitting: Fitting; outer: number; inner: number; count: number }[];
}

/** Behör där ringen inte ingår i satsen; ringen plockas lös. */
export const KIT_FITTINGS: readonly Fitting[] = ["A10.11"];
/** Dubbelbehör som är ett komplett paket per dörr (båda ringarna ingår). */
export const PAIR_FITTINGS: readonly Fitting[] = ["18256"];

/** Summerar allt material för alla dörrar i projektet. */
export function projectTotals(doors: Door[]): Totals {
  const ext = new Map<string, { size: number; kind: RingKind; count: number }>();
  const rings = new Map<string, Totals["rings"][number]>();
  const fittings = new Map<string, Totals["fittings"][number]>();
  const kits = new Map<Fitting, number>();
  const loose = new Map<string, Totals["fittings"][number]>();
  const extKind = (k: RingKind): RingKind => (k === "rund" ? "rund" : "oval");
  const pairs = new Map<string, { outer: number; inner: number; count: number }>();
  const setPairs = new Map<string, Totals["setPairs"][number]>();
  for (const d of doors) {
    const iloqDouble = d.kind === "iloq" && d.sides.length > 1;
    const pairSet = !!d.fitting && PAIR_FITTINGS.includes(d.fitting) && d.sides.length > 1;
    if (iloqDouble || pairSet) {
      const o = d.sides.find((s) => s.label !== "Insida"), i = d.sides.find((s) => s.label === "Insida");
      if (o && i && iloqDouble) { const k = `${o.ring}:${i.ring}`; const c = pairs.get(k) ?? { outer: o.ring, inner: i.ring, count: 0 }; c.count++; pairs.set(k, c); }
      if (o && i && pairSet) { const k = `${d.fitting}:${o.ring}:${i.ring}`; const c = setPairs.get(k) ?? { fitting: d.fitting!, outer: o.ring, inner: i.ring, count: 0 }; c.count++; setPairs.set(k, c); }
    }
    if (d.fitting && KIT_FITTINGS.includes(d.fitting)) kits.set(d.fitting, (kits.get(d.fitting) ?? 0) + 1);
    for (const s of d.sides) {
    for (const e of s.extenders) {
      const k = extKind(d.kind), key = `${k}:${e}`;
      const cur = ext.get(key) ?? { size: e, kind: k, count: 0 };
      cur.count++; ext.set(key, cur);
    }
    const side = RING_HAS_SIDE[d.kind] ? (s.label ?? "Utsida") : "";
    const inner = isIloqInner(d.kind, s.label, d.sides.length > 1);
    const fit = fittingForSide(d.fitting, s.label);
    if (iloqDouble || pairSet) continue;
    if (fit && !KIT_FITTINGS.includes(fit)) {
      const target = isLooseFitting(fit, s.ring) ? loose : fittings;
      const key = `${fit}:${d.kind}:${side}:${s.ring}`;
      const cur = target.get(key) ?? { fitting: fit, size: s.ring, kind: d.kind, side, inner, count: 0 };
      cur.count++; target.set(key, cur);
      continue;
    }
    const key = `${d.kind}:${side}:${inner}:${s.ring}`;
    const cur = rings.get(key) ?? { size: s.ring, kind: d.kind, side, inner, count: 0 };
    cur.count++; rings.set(key, cur);
    }
  }
  const sort = (a: { kind: string; size: number; side?: string }, b: { kind: string; size: number; side?: string }) =>
    a.kind.localeCompare(b.kind) || (b.side ?? "").localeCompare(a.side ?? "") || a.size - b.size;
  const byName = (a: { fitting: Fitting }, b: { fitting: Fitting }) => a.fitting.localeCompare(b.fitting, "sv", { numeric: true });
  return { extenders: [...ext.values()].sort(sort), rings: [...rings.values()].sort(sort), fittings: [...fittings.values()].sort((a, b) => byName(a, b) || sort(a, b)), kits: [...kits].map(([fitting, count]) => ({ fitting, count })), loose: [...loose.values()].sort((a, b) => byName(a, b) || sort(a, b)), doubles: doors.filter((d) => d.sides.length > 1).length, iloqPairs: [...pairs.values()].sort((a, b) => a.outer - b.outer || a.inner - b.inner), setPairs: [...setPairs.values()].sort((a, b) => a.outer - b.outer || a.inner - b.inner) };
}

export function sideText(s: DoorSide, kind: RingKind, fitting?: Fitting, double = false): string {
  const counts = new Map<number, number>();
  s.extenders.forEach((e) => counts.set(e, (counts.get(e) ?? 0) + 1));
  const ext = [...counts].sort((a, b) => a[0] - b[0]).map(([e, n]) => `${n}st ${formatMm(e)} förlängare`);
  const side = RING_HAS_SIDE[kind] && !s.label ? ` ${"utsida"}` : "";
  // Ordning: sida, behör med ring (eller ring), sist förlängare. Runda cylindrar: bara ring.
  const fit = kind === "rund" || (double && fitting && PAIR_FITTINGS.includes(fitting)) ? null : fittingForSide(fitting, s.label);
  const inner = isIloqInner(kind, s.label, double);
  const ring = fit ? `${fittingRingText(fit, s.ring, inner)}${side}` : `${ringName(s.ring, inner)}${side}`;
  return (s.label ? `${s.label}: ` : "") + [ring, ...ext].join(" + ");
}

/** Doors counted in the pick list: all, or only those not yet mounted. */
export function doorsToPick(doors: Door[], remainingOnly: boolean): Door[] {
  return remainingOnly ? doors.filter((d) => !d.done) : doors;
}

/** Totalrad för ring/behör: "27mm iLOQ innerring insida (iLOQ)". */
export function totalRingText(r: { size: number; kind: RingKind; side: string; inner: boolean; fitting?: Fitting }): string {
  const base = r.fitting ? fittingRingText(r.fitting, r.size, r.inner) : ringName(r.size, r.inner);
  return `${base}${r.side ? ` ${r.side.toLowerCase()}` : ""} (${KIND_LABEL[r.kind]})`;
}

export interface PurchaseItem { count: number; text: string }
export interface PurchaseGroup { title: string; items: PurchaseItem[] }
export interface PurchaseSection { title: string; groups: PurchaseGroup[] }

const SECTION_TITLE: Record<RingKind, string> = { oval: "Oval cylinder", rund: "Rund cylinder", iloq: "iLOQ cylinder" };

/**
 * Inköpslista per cylindertyp (oval, rund, iLOQ), varje typ uppdelad i enkelcylinder,
 * dubbelcylinder och förlängare. Dubbelcylindrar står som ett par per dörr (utsida + insida).
 */
export function purchaseList(doors: Door[]): PurchaseSection[] {
  const sections: PurchaseSection[] = [];
  const sorted = (m: Map<string, number>) => [...m].map(([text, count]) => ({ count, text }))
    .sort((a, b) => a.text.localeCompare(b.text, "sv", { numeric: true }));
  const add = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
  for (const kind of ["oval", "rund", "iloq"] as RingKind[]) {
    const ds = doors.filter((d) => d.kind === kind);
    if (!ds.length) continue;
    const single = new Map<string, number>(), kits = new Map<string, number>(), double = new Map<string, number>(), ext = new Map<string, number>();
    const ring = (mm: number) => `${formatMm(mm)} ${kind === "rund" ? "rund ring" : "ring"}`;
    for (const d of ds) {
      d.sides.forEach((s) => s.extenders.forEach((e) => add(ext, `${formatMm(e)} förlängare`)));
      // Runda cylindrar har inga behörssatser – bara ringar.
      const fitting = kind === "rund" ? undefined : d.fitting;
      if (d.sides.length > 1) {
        const o = d.sides.find((s) => s.label !== "Insida") ?? d.sides[0]!;
        const i = d.sides.find((s) => s !== o)!;
        if (kind === "iloq") {
          add(kits, FITTING_LABEL["A10.11"]);
          add(double, `${ring(o.ring)} utsida + ${formatMm(i.ring)} iLOQ innerring insida`);
        } else if (fitting && PAIR_FITTINGS.includes(fitting)) {
          add(double, `${FITTING_LABEL[fitting]} (${formatMm(o.ring)} ring utsida + ${formatMm(i.ring)} ring insida)`);
        } else {
          add(double, `${ring(o.ring)} utsida + ${ring(i.ring)} insida`);
        }
      } else {
        for (const s of d.sides) {
          const fit = fitting && !KIT_FITTINGS.includes(fitting) && !PAIR_FITTINGS.includes(fitting) ? fitting : null;
          add(single, fit ? fittingRingText(fit, s.ring) : ring(s.ring));
        }
      }
    }
    const groups = [
      { title: "Enkelcylinder", items: sorted(single) },
      { title: "Dubbelcylinder", items: [...sorted(kits), ...sorted(double)] },
      { title: "Förlängare", items: sorted(ext) },
    ].filter((g) => g.items.length);
    if (groups.length) sections.push({ title: SECTION_TITLE[kind], groups });
  }
  return sections;
}

export function totalsText(p: Project, remainingOnly = false): string {
  const doors = doorsToPick(p.doors, remainingOnly);
  const word = doors.length === 1 ? "dörr" : "dörrar";
  const lines = [`${p.name || "Projekt"} – ${doors.length} ${remainingOnly ? `kvarvarande ${word}` : word}`];
  for (const s of purchaseList(doors)) {
    lines.push("", `${s.title.toUpperCase()}:`);
    for (const g of s.groups) {
      lines.push(`${g.title}:`);
      g.items.forEach((i) => lines.push(`  ${i.count}st ${i.text}`));
    }
  }
  return lines.join("\n");
}

/** Rubrik per dörr: "Dörr 1 (oval, enkelcylinder)" / "Dörr 2 (oval, dubbelcylinder), 18256 behör". */
export function doorTitle(d: Door): string {
  const pair = d.sides.length > 1 && !!d.fitting && PAIR_FITTINGS.includes(d.fitting);
  return `${d.name} (${KIND_LABEL[d.kind]}, ${d.sides.length > 1 ? "dubbelcylinder" : "enkelcylinder"})${pair ? `, ${FITTING_LABEL[d.fitting!]}` : ""}`;
}

export function doorsText(p: Project): string {
  return p.doors.map((d) => [doorTitle(d), ...d.sides.map((s) => "  " + sideText(s, d.kind, d.fitting, d.sides.length > 1))].join("\n")).join("\n");
}

/** Whole project as shareable text: every door, then the full material list. */
export function projectText(p: Project): string {
  const doors = p.doors.map((d) => [`${doorTitle(d)}${d.done ? " – monterad" : ""}`, ...d.sides.map((s) => "  " + sideText(s, d.kind, d.fitting, d.sides.length > 1))].join("\n")).join("\n\n");
  return [`${p.name || "Projekt"}`, "", "Dörrar:", doors, "", "Totalt material:", totalsText(p).split("\n").slice(2).join("\n")].join("\n").trim();
}

/** Empties a project's doors but keeps the project and its name. */
export function clearDoors(p: Project): Project {
  return { ...p, doors: [] };
}
