// Extra skyltar/behör: mått från Fredriks kollega, inte cylinderringar.
// Varje behör har mått per sida; null = finns inte på den sidan (vredskyltar bara insida).
type Fitting = { id: string; name: string; outside: number | null; inside: number };

export const OFFICE_FITTINGS: readonly Fitting[] = [
  { id: "slug17", name: "SLUG 17", outside: 3, inside: 3 },
  { id: "slug08", name: "SLUG 08", outside: 4, inside: 4 },
  { id: "assa179", name: "ASSA 179", outside: 5, inside: 5 },
  { id: "assa179-stainless", name: "ASSA 179 Rostfri", outside: 4, inside: 4 },
  { id: "assa4291", name: "ASSA 4291 skylt", outside: 5, inside: 5 },
  { id: "st17903", name: "ST17903", outside: 2, inside: 2 },
  { id: "st17904", name: "ST17904", outside: 2, inside: 2 },
  { id: "st17910", name: "ST17910", outside: 2, inside: 5 },
  { id: "st17911", name: "ST17911", outside: 2, inside: 5 },
  { id: "st17912", name: "ST17912", outside: 2, inside: 5 },
  { id: "st17950", name: "ST17950", outside: 2, inside: 2 },
  { id: "st17951", name: "ST17951", outside: 2, inside: 2 },
  { id: "assa-thumb", name: "ASSA Vredskylt", outside: null, inside: 3 },
  { id: "habo-thumb", name: "HABO Vredskylt", outside: null, inside: 3 },
  { id: "dorma-thumb", name: "Dorma Vredskylt", outside: null, inside: 3.5 },
  { id: "hoppe-thumb", name: "Hoppe Vredskylt", outside: null, inside: 3 },
];

export function officeFittingsFor(side: "outside" | "inside") {
  return OFFICE_FITTINGS.filter((f) => f[side] !== null).map((f) => ({ id: f.id, name: f.name, mm: f[side] as number }));
}

export function officeFittingMm(ids: readonly string[], side: "outside" | "inside"): number {
  return ids.reduce((sum, id) => sum + (OFFICE_FITTINGS.find((f) => f.id === id)?.[side] ?? 0), 0);
}
