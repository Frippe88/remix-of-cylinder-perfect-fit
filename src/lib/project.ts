// Projekt med flera dörrar – ren logik (lagring sköts i UI via localStorage).
import { formatMm } from "./cylinder";

export type RingKind = "oval" | "rund" | "iloq";
export interface DoorSide { label: string | null; depth: number; ring: number; extenders: number[] }
export interface Door { id: string; name: string; kind: RingKind; done: boolean; sides: DoorSide[] }
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
}

/** Summerar allt material för alla dörrar i projektet. */
export function projectTotals(doors: Door[]): Totals {
  const ext = new Map<string, { size: number; kind: RingKind; count: number }>();
  const rings = new Map<string, { size: number; kind: RingKind; side: string; count: number }>();
  const extKind = (k: RingKind): RingKind => (k === "rund" ? "rund" : "oval");
  for (const d of doors) for (const s of d.sides) {
    for (const e of s.extenders) {
      const k = extKind(d.kind), key = `${k}:${e}`;
      const cur = ext.get(key) ?? { size: e, kind: k, count: 0 };
      cur.count++; ext.set(key, cur);
    }
    const side = RING_HAS_SIDE[d.kind] ? (s.label ?? "Utsida") : "";
    const key = `${d.kind}:${side}:${s.ring}`;
    const cur = rings.get(key) ?? { size: s.ring, kind: d.kind, side, count: 0 };
    cur.count++; rings.set(key, cur);
  }
  const sort = (a: { kind: string; size: number; side?: string }, b: { kind: string; size: number; side?: string }) =>
    a.kind.localeCompare(b.kind) || (b.side ?? "").localeCompare(a.side ?? "") || a.size - b.size;
  return { extenders: [...ext.values()].sort(sort), rings: [...rings.values()].sort(sort) };
}

function sideText(s: DoorSide, kind: RingKind): string {
  const counts = new Map<number, number>();
  s.extenders.forEach((e) => counts.set(e, (counts.get(e) ?? 0) + 1));
  const parts = [...counts].sort((a, b) => a[0] - b[0]).map(([e, n]) => `${n}st ${formatMm(e)} förlängare`);
  const side = RING_HAS_SIDE[kind] ? ` ${(s.label ?? "Utsida").toLowerCase()}` : "";
  parts.push(`${formatMm(s.ring)} ring${side}`);
  return (s.label ? `${s.label}: ` : "") + parts.join(" + ");
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
  return lines.join("\n");
}

export function doorsText(p: Project): string {
  return p.doors.map((d) => [`${d.name} (${KIND_LABEL[d.kind]})`, ...d.sides.map((s) => "  " + sideText(s, d.kind))].join("\n")).join("\n");
}
