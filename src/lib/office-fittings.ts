// Extra skyltar/behör: mått från Fredriks kollega, inte cylinderringar.
// Varje behör har mått per sida; null = finns inte på den sidan (vredskyltar bara insida).
type Fitting = { id: string; name: string; outside: number | null; inside: number };

export const OFFICE_FITTINGS: readonly Fitting[] = [
  { id: "slug17", name: "SLUG 17", outside: 3, inside: 3 },
  { id: "slug08", name: "SLUG 08", outside: 4, inside: 4 },
  { id: "assa4291", name: "ASSA 4291 skylt", outside: 5, inside: 5 },
  { id: "assa179", name: "ASSA 179", outside: 5, inside: 5 },
  { id: "assa179-stainless", name: "ASSA 179 Rostfri", outside: 4, inside: 4 },
  { id: "st17903", name: "ST17903", outside: 2, inside: 2 },
  { id: "st17904", name: "ST17904", outside: 2, inside: 2 },
  { id: "st17910", name: "ST17910", outside: 2, inside: 5 },
  { id: "st17912", name: "ST17912", outside: 2, inside: 5 },
  { id: "st17950", name: "ST17950", outside: 2, inside: 2 },
  { id: "st17951", name: "ST17951", outside: 2, inside: 2 },
  { id: "assa-thumb", name: "ASSA Vredskylt", outside: null, inside: 3 },
  { id: "habo-thumb", name: "HABO Vredskylt", outside: null, inside: 3 },
  { id: "dorma-thumb", name: "Dorma Vredskylt", outside: null, inside: 3.5 },
  { id: "hoppe-thumb", name: "Hoppe Vredskylt", outside: null, inside: 3 },
];

/** Behör som kan väljas per sida (Ute/Inne/Båda). */
export const SIDE_CHOICE_IDS: readonly string[] = ["slug17", "slug08", "assa4291"];

export type FittingPlacement = "outside" | "inside" | "both";
/** En gemensam behörslista: behör-id → placering. Saknas = inte valt. */
export type FittingSelection = Record<string, FittingPlacement>;

export function officeFittingsFor(side: "outside" | "inside") {
  return OFFICE_FITTINGS.filter((f) => f[side] !== null).map((f) => ({ id: f.id, name: f.name, mm: f[side] as number }));
}

export function officeFittingMm(ids: readonly string[], side: "outside" | "inside"): number {
  return ids.reduce((sum, id) => sum + (OFFICE_FITTINGS.find((f) => f.id === id)?.[side] ?? 0), 0);
}

/** Summerar påbyggnad på en sida från den gemensamma listan. */
export function selectionMm(sel: FittingSelection, side: "outside" | "inside"): number {
  const ids = Object.entries(sel).filter(([, p]) => p === side || p === "both").map(([id]) => id);
  return officeFittingMm(ids, side);
}

/** Tillåtna placeringar per behör (vredskyltar bara insida). */
export function placementsFor(id: string): FittingPlacement[] {
  const f = OFFICE_FITTINGS.find((x) => x.id === id);
  if (!f) return [];
  if (f.outside === null) return ["inside"];
  // Bara lösa skyltar kan sitta på en sida; 179-beslag är genomgående och bygger alltid båda.
  return SIDE_CHOICE_IDS.includes(f.id) ? ["outside", "inside", "both"] : ["both"];
}

/**
 * A = dörrtjocklek, B = utsida → centrum kista, C = insida → centrum kista.
 * B + C = A. Två kända mått räcker; det tredje räknas ut. Kistan sitter sällan i centrum,
 * så B och C kan aldrig gissas från bara A.
 */
export function resolveABC(a: number | null, b: number | null, c: number | null): { a: number | null; b: number | null; c: number | null; mismatch: boolean } {
  const r = (n: number) => Math.round(n * 10) / 10;
  if (b !== null && c !== null) return { a: r(b + c), b, c, mismatch: a !== null && Math.abs(a - (b + c)) > 0.05 };
  if (a !== null && b !== null) return { a, b, c: a - b > 0 ? r(a - b) : null, mismatch: false };
  if (a !== null && c !== null) return { a, b: a - c > 0 ? r(a - c) : null, c, mismatch: false };
  return { a, b, c, mismatch: false };
}
