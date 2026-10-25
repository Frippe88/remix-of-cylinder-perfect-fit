// Projekt med flera dörrar – ren logik (lagring sköts i UI via localStorage).
import { formatMm } from "./cylinder";

export type RingKind = "oval" | "rund" | "iloq";
export type Fitting = "256" | "2356" | "3212" | "18256" | "DAK 7200" | "DAK 7101" | "DAK 752" | "A10.11";
export const FITTING_LABEL: Record<Fitting, string> = {
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
  return `${FITTING_LABEL[fitting]}, plocka själv`;
}
export function fittingRingText(fitting: Fitting, ring: number, inner = false): string {
  const name = isLooseFitting(fitting, ring) ? looseFittingLabel(fitting) : FITTING_LABEL[fitting];
  return `${name} med ${ringName(ring, inner || fitting === "A10.11")}`;
}
/** Vilka behör som kan väljas för given cylinder. Tom lista = inget behörsval. */
export function fittingOptions(variant: "free" | "pro", cylinder: "standard" | "round" | "iloq", type: "single" | "double", brand?: string): Fitting[] {
  if (variant !== "pro") return [];
  if (cylinder === "round") return brand === "ASSA ABLOY" ? ["3212"] : brand === "dormakaba / DORMA" ? ["DAK 752"] : [];
  if (type === "double") return cylinder === "standard" ? ["18256"] : ["A10.11"];
  return cylinder === "standard" ? ["256", "2356", "DAK 7200", "DAK 7101"] : ["256", "2356"];
}
export function canSelectFitting(variant: "free" | "pro", cylinder: "standard" | "round" | "iloq", type: "single" | "double", brand?: string): boolean {
  return fittingOptions(variant, cylinder, type, brand).length > 0;
}
export interface DoorSide { label: string | null; depth: number; ring: number; extenders: number[] }
export interface Door { id: string; name: string; kind: RingKind; done: boolean; sides: DoorSide[]; fitting?: Fitting }
export interface Project { name: string; doors: Door[] }

export const KIND_LABEL: Record<RingKind, string> = { oval: "oval", rund: "rund", iloq: "iLOQ" };

// Runda cylindrar har likadan ring på utsidan och insidan – den behöver inte delas upp per sida.
export const RING_HAS_SIDE: Record<RingKind, boolean> = { oval: true, rund: false, iloq: true };

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
  /** 256/2356 med ring över 18 mm: behöret plockas själv, ringen räknas under ringar. */
  loose: { fitting: Fitting; count: number }[];
}

/** Behör där ringen inte ingår i satsen; ringen plockas lös. */
export const KIT_FITTINGS: readonly Fitting[] = ["A10.11"];

/** Summerar allt material för alla dörrar i projektet. */
export function projectTotals(doors: Door[]): Totals {
  const ext = new Map<string, { size: number; kind: RingKind; count: number }>();
  const rings = new Map<string, Totals["rings"][number]>();
  const fittings = new Map<string, Totals["fittings"][number]>();
  const kits = new Map<Fitting, number>();
  const loose = new Map<Fitting, number>();
  const extKind = (k: RingKind): RingKind => (k === "rund" ? "rund" : "oval");
  for (const d of doors) {
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
    if (fit && isLooseFitting(fit, s.ring)) loose.set(fit, (loose.get(fit) ?? 0) + 1);
    else if (fit && !KIT_FITTINGS.includes(fit)) {
      const key = `${fit}:${d.kind}:${side}:${s.ring}`;
      const cur = fittings.get(key) ?? { fitting: fit, size: s.ring, kind: d.kind, side, inner, count: 0 };
      cur.count++; fittings.set(key, cur);
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
  return { extenders: [...ext.values()].sort(sort), rings: [...rings.values()].sort(sort), fittings: [...fittings.values()].sort((a, b) => byName(a, b) || sort(a, b)), kits: [...kits].map(([fitting, count]) => ({ fitting, count })), loose: [...loose].map(([fitting, count]) => ({ fitting, count })).sort(byName) };
}

export function sideText(s: DoorSide, kind: RingKind, fitting?: Fitting, double = false): string {
  const counts = new Map<number, number>();
  s.extenders.forEach((e) => counts.set(e, (counts.get(e) ?? 0) + 1));
  const ext = [...counts].sort((a, b) => a[0] - b[0]).map(([e, n]) => `${n}st ${formatMm(e)} förlängare`);
  const side = RING_HAS_SIDE[kind] && !s.label ? ` ${"utsida"}` : "";
  // Ordning: sida, behör med ring (eller ring), sist förlängare.
  const fit = fittingForSide(fitting, s.label);
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

export function totalsText(p: Project, remainingOnly = false): string {
  const doors = doorsToPick(p.doors, remainingOnly);
  const t = projectTotals(doors);
  const word = doors.length === 1 ? "dörr" : "dörrar";
  const lines = [`${p.name || "Projekt"} – ${doors.length} ${remainingOnly ? `kvarvarande ${word}` : word}`];
  if (t.kits.length) { lines.push("", "Monteringskit iLOQ:"); t.kits.forEach((k) => lines.push(`${k.count}st ${FITTING_LABEL[k.fitting]}`)); }
  if (t.extenders.length) { lines.push("", "Förlängare:"); t.extenders.forEach((e) => lines.push(`${e.count}st ${formatMm(e.size)} (${KIND_LABEL[e.kind]})`)); }
  if (t.rings.length) { lines.push("", "Ringar:"); t.rings.forEach((r) => lines.push(`${r.count}st ${totalRingText(r)}`)); }
  if (t.fittings.length) { lines.push("", "Behör med ring:"); t.fittings.forEach((f) => lines.push(`${f.count}st ${totalRingText(f)}`)); }
  if (t.loose.length) { lines.push("", "Behör, plocka själv:"); t.loose.forEach((f) => lines.push(`${f.count}st ${looseFittingLabel(f.fitting)}`)); }
  return lines.join("\n");
}

export function doorsText(p: Project): string {
  return p.doors.map((d) => [`${d.name} (${KIND_LABEL[d.kind]})`, ...d.sides.map((s) => "  " + sideText(s, d.kind, d.fitting, d.sides.length > 1))].join("\n")).join("\n");
}

/** Whole project as shareable text: every door, then the full material list. */
export function projectText(p: Project): string {
  const doors = p.doors.map((d) => [`${d.name} (${KIND_LABEL[d.kind]})${d.done ? " – monterad" : ""}`, ...d.sides.map((s) => "  " + sideText(s, d.kind, d.fitting, d.sides.length > 1))].join("\n")).join("\n\n");
  return [`${p.name || "Projekt"}`, "", "Dörrar:", doors, "", "Totalt material:", totalsText(p).split("\n").slice(2).join("\n")].join("\n").trim();
}

/** Empties a project's doors but keeps the project and its name. */
export function clearDoors(p: Project): Project {
  return { ...p, doors: [] };
}
