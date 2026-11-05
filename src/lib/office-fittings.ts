// Extra skyltar/behör: mått från Fredriks kollega, inte cylinderringar.
export const OFFICE_FITTINGS = [
  { id: "slug17", name: "SLUG 17", mm: 3 },
  { id: "slug08", name: "SLUG 08", mm: 4 },
  { id: "assa179", name: "ASSA 179", mm: 5 },
  { id: "assa179-stainless", name: "ASSA 179 Rostfri", mm: 4 },
  { id: "assa4291", name: "ASSA 4291 skylt", mm: 5 },
  { id: "assa-thumb", name: "ASSA Vredskylt", mm: 3 },
  { id: "habo-thumb", name: "HABO Vredskylt", mm: 3 },
  { id: "dorma-thumb", name: "Dorma Vredskylt", mm: 3.5 },
  { id: "hoppe-thumb", name: "Hoppe Vredskylt", mm: 3 },
  { id: "st17903", name: "ST17903", mm: 2 },
  { id: "st17904", name: "ST17904", mm: 2 },
] as const;

export const OFFICE_PAIR_FITTINGS = [
  { id: "st17910", name: "ST17910", outside: 2, inside: 5 },
  { id: "st17911", name: "ST17911", outside: 2, inside: 5 },
  { id: "st17912", name: "ST17912", outside: 2, inside: 5 },
  { id: "st17950", name: "ST17950", outside: 2, inside: 2 },
  { id: "st17951", name: "ST17951", outside: 2, inside: 2 },
] as const;

export function officeFittingMm(ids: readonly string[], pairId: string, side: "outside" | "inside"): number {
  const single = OFFICE_FITTINGS.filter((f) => ids.includes(f.id)).reduce((sum, f) => sum + f.mm, 0);
  const pair = OFFICE_PAIR_FITTINGS.find((f) => f.id === pairId);
  return single + (pair?.[side] ?? 0);
}