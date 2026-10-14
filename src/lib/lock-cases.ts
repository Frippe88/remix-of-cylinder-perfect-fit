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

const MANUFACTURER_SEARCH: Record<LockBrand, (lock: LockCase) => string> = {
  ASSA: (lock) =>
    `https://www.assaabloy.com/se/sv/search?q=${encodeURIComponent(`ASSA ${lock.model} monteringsanvisning`)}`,
  // STEP har direkta produktsidor per modell; " med mikrobrytare" är en variant, samma produktsida.
  STEP: (lock) => {
    const base = lock.model.replace(/ med mikrobrytare$/, "");
    const slug = encodeURIComponent(base);
    return `https://steplock.com/SE/sv/product/${slug}/${slug}`;
  },
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

/** Verifierade direktlänkar till tillverkarens manual-PDF (hämtade från steplock.com produktsidor). */
const MANUAL_PDF: Record<string, string> = {
  "STEP 18": "https://api.steplock.com/medias/Manual-STEP-18-Omva-nd-SV.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDk0MDcxMHxhcHBsaWNhdGlvbi9wZGZ8YUdJMkwyZzFPQzg0TnprMk5UWTNNalF3TnpNMEwwMWhiblZoYkY5VFZFVlFYekU0WDA5dGRtSE1pRzVrWDFOV0xuQmtaZ3w1MTMwM2NlZmFmYjg5YzI3YmIyM2I0MDQzZjEwOWVhYTYwZjNkYTA4MjU1MDVkMDc3NDUzMzFkODlkNzI5YWRh",
  "STEP 90": "https://api.steplock.com/medias/Manual-STEP-90.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDYxOTgyMHxhcHBsaWNhdGlvbi9wZGZ8YURNNEwyZzNZaTg0TnprMk5UWTVNamN5TXpVd0wwMWhiblZoYkY5VFZFVlFYemt3TG5Ca1pnfDg0Nzc5ODZiMWQ3ZGZmYmIzM2IxYjMxNzBkMjFhMTM5MzllNDJjN2RlNjZkNWRjY2UwNWVkY2IwMjNlY2MwZjk",
  "STEP 92": "https://api.steplock.com/medias/Manual-STEP-92.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDM4NTMxMnxhcHBsaWNhdGlvbi9wZGZ8YURNMUwyZzNaUzg0TnprMk5UWTVNek0zT0RnMkwwMWhiblZoYkY5VFZFVlFYemt5TG5Ca1pnfDVmZDQyMWE1YTUxNWE5ZTgyNmI3NDRmOTJiNDFmMzBlMDQxZjk1NzhkZTI0OGMwNTE0ODYyOTU5MmJhMDIyZWY",
  "STEP 110": "https://api.steplock.com/medias/Manual-STEP-110-120.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDI0MDUzMzd8YXBwbGljYXRpb24vcGRmfGFHUXhMMmhpTnk4NE56azJOVFkyTlRnMU16YzBMMDFoYm5WaGJGOVRWRVZRWHpFeE1GOHhNakF1Y0dSbXw2ZjFlNjFkY2Y4NmYzMTA5ODY1MjA3YjEyNzE1ZTE1MWMxZjI3ZWU3OTUyMDliOTkxMDA4YzFmNTczNDZiMTUz",
  "STEP 120": "https://api.steplock.com/medias/Manual-STEP-110-120.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDI0MDUzMzd8YXBwbGljYXRpb24vcGRmfGFHUXhMMmhpTnk4NE56azJOVFkyTlRnMU16YzBMMDFoYm5WaGJGOVRWRVZRWHpFeE1GOHhNakF1Y0dSbXw2ZjFlNjFkY2Y4NmYzMTA5ODY1MjA3YjEyNzE1ZTE1MWMxZjI3ZWU3OTUyMDliOTkxMDA4YzFmNTczNDZiMTUz",
  "STEP 130": "https://api.steplock.com/medias/Installationsanvisning-STEP-130-utga-va-11-webb.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDIyMjYxODZ8YXBwbGljYXRpb24vcGRmfGFHTTRMMmd6WVM4NE9UQTVOVGM0TURjMk1Ua3dMMGx1YzNSaGJHeGhkR2x2Ym5OaGJuWnBjMjVwYm1jZ1UxUkZVQ0F4TXpCZmRYUm5ZY3lLZG1FZ01URmZkMlZpWWk1d1pHWXxiYzI5MWJiNzNlNzFkN2U3YmRlY2I3YWFkODcwZWEzZWZlYzQyNGQ1N2QxNGJiOGNkMWYzZmMwYjk2OWRmNzUw",
  "STEP 350": "https://api.steplock.com/medias/STEP-motorla-s-300-serien-OSDP-quickguide-2025-utg.7-SV.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDI4OTgxNTh8YXBwbGljYXRpb24vcGRmfGFHUXlMMmhqTUM4NE9UQXlOalUwTURrNU5EZzJMMU5VUlZBZ2JXOTBiM0pzWWN5S2N5QXpNREF0YzJWeWFXVnVYMDlUUkZCZmNYVnBZMnRuZFdsa1pWOHlNREkxWDNWMFp5NDNYMU5XTG5Ca1pnfDZiOTcwZDcyODkzZjFkMzAyMGM2MzM5OWI4MjczZTVhMjMwZWU1ODEyM2Q1NzJlYzkwY2E2Yjg0ODU5YTBmZTM",
  "STEP 351": "https://api.steplock.com/medias/STEP-motorla-s-300-serien-ST500C-OSDP-manual-2026-utg.8-SV.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDUzNzk2NzR8YXBwbGljYXRpb24vcGRmfGFHVXhMMmhrTXk4NE9UQXlOemcyTURnNE9Ua3dMMU5VUlZBZ2JXOTBiM0pzWWN5S2N5QXpNREF0YzJWeWFXVnVYMU5VTlRBd1ExOVBVMFJRWDIxaGJuVmhiRjh5TURJMlgzVjBaeTQ0WDFOV0xuQmtaZ3wyZTJkMTI5NWRiZWE3ZmI5MGFjMzliYmNmNTJiN2M0Y2ZhZGMxYTcxYjA5NTVkNTdjMTZiNWE5OGI4OTI5YzNl",
  "STEP 352": "https://api.steplock.com/medias/STEP-motorla-s-300-serien-OSDP-quickguide-2025-utg.7-SV.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDI4OTgxNTh8YXBwbGljYXRpb24vcGRmfGFHUXlMMmhqTUM4NE9UQXlOalUwTURrNU5EZzJMMU5VUlZBZ2JXOTBiM0pzWWN5S2N5QXpNREF0YzJWeWFXVnVYMDlUUkZCZmNYVnBZMnRuZFdsa1pWOHlNREkxWDNWMFp5NDNYMU5XTG5Ca1pnfDZiOTcwZDcyODkzZjFkMzAyMGM2MzM5OWI4MjczZTVhMjMwZWU1ODEyM2Q1NzJlYzkwY2E2Yjg0ODU5YTBmZTM",
};

export function hasDirectManual(lock: LockCase): boolean {
  return lock.model.replace(/ med mikrobrytare$/, "") in MANUAL_PDF;
}

/** Direkt till manualen om verifierad länk finns, annars tillverkarens produktsida/sök. */
export function manualSearchUrl(lock: LockCase): string {
  const pdf = MANUAL_PDF[lock.model.replace(/ med mikrobrytare$/, "")];
  if (pdf) return pdf;
  return MANUFACTURER_SEARCH[lock.brand](lock);
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
