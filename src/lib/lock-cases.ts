export type LockBrand = "ASSA" | "STEP";
export type LockCategory = "mekaniskt" | "mikro" | "eltryck" | "motor";

export interface LockCase {
  id: string;
  brand: LockBrand;
  model: string;
  category: LockCategory;
  note: string;
}

export const CATEGORY_LABEL: Record<LockCategory, string> = {
  mekaniskt: "Mekaniskt",
  mikro: "Mikro / indikering",
  eltryck: "Eltryckeslås",
  motor: "Motorlås",
};

const MANUFACTURER_SITE: Record<LockBrand, string> = {
  ASSA: "assaabloy.com",
  STEP: "steplock.se",
};

export const LOCK_CASES: LockCase[] = [
  { id: "assa-310", brand: "ASSA", model: "Connect 310", category: "mekaniskt", note: "Låshus för tryckeslås, vanligt i ytterdörrar." },
  { id: "assa-410", brand: "ASSA", model: "Connect 410", category: "mekaniskt", note: "Smalt låshus för profildörrar." },
  { id: "assa-560", brand: "ASSA", model: "Connect 560", category: "mekaniskt", note: "Låshus med regel och fallkolv." },
  { id: "assa-565", brand: "ASSA", model: "Connect 565", category: "mekaniskt", note: "Smalt låshus för profildörrar." },
  { id: "assa-2002", brand: "ASSA", model: "2002", category: "mekaniskt", note: "Klassiskt cylinderlåshus." },
  { id: "assa-8765", brand: "ASSA", model: "8765", category: "mekaniskt", note: "Låshus för boendemiljö." },
  { id: "assa-310m", brand: "ASSA", model: "Connect 310 med mikrobrytare", category: "mikro", note: "Mekaniskt låshus med lägesindikering." },
  { id: "assa-560m", brand: "ASSA", model: "Connect 560 med mikrobrytare", category: "mikro", note: "Mekaniskt låshus med lägesindikering." },
  { id: "assa-810s", brand: "ASSA", model: "810S", category: "eltryck", note: "Eltryckeslås." },
  { id: "assa-811s", brand: "ASSA", model: "811S", category: "eltryck", note: "Eltryckeslås, smal variant." },
  { id: "assa-840c", brand: "ASSA", model: "840C", category: "eltryck", note: "Eltryckeslås, Connect-serien." },
  { id: "assa-841c", brand: "ASSA", model: "841C", category: "eltryck", note: "Eltryckeslås för profildörrar." },
  { id: "assa-850", brand: "ASSA", model: "850", category: "motor", note: "Motorlås." },
  { id: "assa-8100", brand: "ASSA", model: "8100 Hi-O", category: "motor", note: "Motorlås med Hi-O-bussteknik." },
  { id: "step-18", brand: "STEP", model: "STEP 18", category: "mekaniskt", note: "Mekaniskt låshus." },
  { id: "step-28", brand: "STEP", model: "STEP 28", category: "mekaniskt", note: "Mekaniskt låshus." },
  { id: "step-38", brand: "STEP", model: "STEP 38", category: "mekaniskt", note: "Mekaniskt låshus." },
  { id: "step-90", brand: "STEP", model: "STEP 90", category: "mekaniskt", note: "Mekaniskt låshus." },
  { id: "step-92", brand: "STEP", model: "STEP 92", category: "mekaniskt", note: "Mekaniskt låshus." },
  { id: "step-18m", brand: "STEP", model: "STEP 18 med mikrobrytare", category: "mikro", note: "Med lägesindikering." },
  { id: "step-28m", brand: "STEP", model: "STEP 28 med mikrobrytare", category: "mikro", note: "Med lägesindikering." },
  { id: "step-110", brand: "STEP", model: "STEP 110", category: "eltryck", note: "Eltryckeslås." },
  { id: "step-120", brand: "STEP", model: "STEP 120", category: "eltryck", note: "Eltryckeslås." },
  { id: "step-130", brand: "STEP", model: "STEP 130", category: "eltryck", note: "Eltryckeslås." },
  { id: "step-350", brand: "STEP", model: "STEP 350", category: "motor", note: "Motorlås." },
  { id: "step-351", brand: "STEP", model: "STEP 351", category: "motor", note: "Motorlås." },
  { id: "step-352", brand: "STEP", model: "STEP 352", category: "motor", note: "Motorlås." },
];

/** Söklänk till tillverkarens egna sidor – vi länkar aldrig till gissade PDF-adresser. */
export function manualSearchUrl(lock: LockCase): string {
  const name = lock.brand === "ASSA" ? `ASSA ${lock.model}` : lock.model;
  const q = `${name} monteringsanvisning site:${MANUFACTURER_SITE[lock.brand]}`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

export function filterLocks(
  locks: LockCase[],
  query: string,
  brand: LockBrand | "alla",
  category: LockCategory | "alla",
): LockCase[] {
  const q = query.trim().toLowerCase();
  return locks.filter(
    (l) =>
      (brand === "alla" || l.brand === brand) &&
      (category === "alla" || l.category === category) &&
      (!q || `${l.brand} ${l.model}`.toLowerCase().includes(q)),
  );
}
