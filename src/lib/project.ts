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
export function isIloqInner(kind: RingKind | undefined, label: string | null | undefined): boolean {
  return kind === "iloq" && label === "Insida";
}
export function ringName(ring: number, kind?: RingKind, label?: string | null): string {
  return `${formatMm(ring)} ${isIloqInner(kind, label) ? "iLOQ innerring" : "ring"}`;
}
/** Gäller behöret just den här sidan? A10.11 hör till insidan; övriga behör till alla sidor. */
export function fittingForSide(fitting: Fitting | null | undefined, label: string | null | undefined): Fitting | null {
  if (!fitting) return null;
  if (fitting === "A10.11") return label === "Insida" ? fitting : null;
  return fitting;
}
export function fittingRingText(fitting: Fitting, ring: number, kind?: RingKind, label?: string | null): string {
  return `${FITTING_LABEL[fitting]} med ${ringName(ring, kind, label)}`;
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
  rings: { size: number; kind: RingKind; side: string; count: number }[];
  fittings: { fitting: Fitting; size: number; kind: RingKind; side: string; count: number }[];
}

/** Summerar allt material för alla dörrar i projektet. */
export function projectTotals(doors: Door[]): Totals {
  const ext = new Map<string, { size: number; kind: RingKind; count: number }>();
  const rings = new Map<string, { size: number; kind: RingKind; side: string; count: number }>();
  const fittings = new Map<string, Totals["fittings"][number]>();
  const extKind = (k: RingKind): RingKind => (k === "rund" ? "rund" : "oval");
  for (const d of doors) for (const s of d.sides) {
    for (const e of s.extenders) {
      const k = extKind(d.kind), key = `${k}:${e}`;
      const cur = ext.get(key) ?? { size: e, kind: k, count: 0 };
      cur.count++; ext.set(key, cur);
    }
    const side = RING_HAS_SIDE[d.kind] ? (s.label ?? "Utsida") : "";
    if (d.fitting) {
      const key = `${d.fitting}:${d.kind}:${side}:${s.ring}`;
      const cur = fittings.get(key) ?? { fitting: d.fitting, size: s.ring, kind: d.kind, side, count: 0 };
      cur.count++; fittings.set(key, cur);
      continue;
    }
    const key = `${d.kind}:${side}:${s.ring}`;
    const cur = rings.get(key) ?? { size: s.ring, kind: d.kind, side, count: 0 };
    cur.count++; rings.set(key, cur);
  }
  const sort = (a: { kind: string; size: number; side?: string }, b: { kind: string; size: number; side?: string }) =>
    a.kind.localeCompare(b.kind) || (b.side ?? "").localeCompare(a.side ?? "") || a.size - b.size;
  return { extenders: [...ext.values()].sort(sort), rings: [...rings.values()].sort(sort), fittings: [...fittings.values()].sort((a, b) => a.fitting.localeCompare(b.fitting, "sv", { numeric: true }) || sort(a, b)) };
}

export function sideText(s: DoorSide, kind: RingKind, fitting?: Fitting): string {
  const counts = new Map<number, number>();
  s.extenders.forEach((e) => counts.set(e, (counts.get(e) ?? 0) + 1));
  const ext = [...counts].sort((a, b) => a[0] - b[0]).map(([e, n]) => `${n}st ${formatMm(e)} förlängare`);
  const side = RING_HAS_SIDE[kind] && !s.label ? ` ${"utsida"}` : "";
  // Ordning: sida, behör med ring (eller ring), sist förlängare.
  const ring = fitting ? `${fittingRingText(fitting, s.ring)}${side}` : `${formatMm(s.ring)} ring${side}`;
  return (s.label ? `${s.label}: ` : "") + [ring, ...ext].join(" + ");
}

/** Doors counted in the pick list: all, or only those not yet mounted. */
export function doorsToPick(doors: Door[], remainingOnly: boolean): Door[] {
  return remainingOnly ? doors.filter((d) => !d.done) : doors;
}

export function totalsText(p: Project, remainingOnly = false): string {
  const doors = doorsToPick(p.doors, remainingOnly);
  const t = projectTotals(doors);
  const word = doors.length === 1 ? "dörr" : "dörrar";
  const lines = [`${p.name || "Projekt"} – ${doors.length} ${remainingOnly ? `kvarvarande ${word}` : word}`];
  if (t.extenders.length) { lines.push("", "Förlängare:"); t.extenders.forEach((e) => lines.push(`${e.count}st ${formatMm(e.size)} (${KIND_LABEL[e.kind]})`)); }
  if (t.rings.length) { lines.push("", "Ringar:"); t.rings.forEach((r) => lines.push(`${r.count}st ${formatMm(r.size)} ring${r.side ? ` ${r.side.toLowerCase()}` : ""} (${KIND_LABEL[r.kind]})`)); }
  if (t.fittings.length) { lines.push("", "Behör med ring:"); t.fittings.forEach((f) => lines.push(`${f.count}st ${fittingRingText(f.fitting, f.size)}${f.side ? ` ${f.side.toLowerCase()}` : ""} (${KIND_LABEL[f.kind]})`)); }
  return lines.join("\n");
}

export function doorsText(p: Project): string {
  return p.doors.map((d) => [`${d.name} (${KIND_LABEL[d.kind]})`, ...d.sides.map((s) => "  " + sideText(s, d.kind, d.fitting))].join("\n")).join("\n");
}

/** Whole project as shareable text: every door, then the full material list. */
export function projectText(p: Project): string {
  const doors = p.doors.map((d) => [`${d.name} (${KIND_LABEL[d.kind]})${d.done ? " – monterad" : ""}`, ...d.sides.map((s) => "  " + sideText(s, d.kind, d.fitting))].join("\n")).join("\n\n");
  return [`${p.name || "Projekt"}`, "", "Dörrar:", doors, "", "Totalt material:", totalsText(p).split("\n").slice(2).join("\n")].join("\n").trim();
}

/** Empties a project's doors but keeps the project and its name. */
export function clearDoors(p: Project): Project {
  return { ...p, doors: [] };
}
