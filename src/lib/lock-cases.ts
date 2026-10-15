export type LockBrand = "ASSA" | "STEP" | "SAFETRON";
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
  SAFETRON: (lock) =>
    `https://www.safetron.com/?s=${encodeURIComponent(lock.model)}`,
};

export const LOCK_CASES: LockCase[] = [
  { id: "assa-310", brand: "ASSA", model: "Connect 310", category: "mekaniskt", note: "Låshus för tryckeslås, vanligt i ytterdörrar." },
  { id: "assa-311", brand: "ASSA", model: "Connect 311", category: "mekaniskt", note: "Enkelt regellås, 300-serien." },
  { id: "assa-313", brand: "ASSA", model: "Connect 313", category: "mekaniskt", note: "Enkelt regellås, 300-serien." },
  { id: "assa-212", brand: "ASSA", model: "Connect 212", category: "mekaniskt", note: "Fallås, 200-serien." },
  { id: "assa-216", brand: "ASSA", model: "Connect 216", category: "mekaniskt", note: "Fallås, 200-serien." },
  { id: "assa-220", brand: "ASSA", model: "Connect 220", category: "mekaniskt", note: "Fallås, 200-serien." },
  { id: "assa-221", brand: "ASSA", model: "Connect 221", category: "mekaniskt", note: "Fallås, 200-serien." },
  { id: "assa-222", brand: "ASSA", model: "Connect 222", category: "mekaniskt", note: "Fallås, 200-serien." },
  { id: "assa-223", brand: "ASSA", model: "Connect 223", category: "mekaniskt", note: "Fallås, 200-serien." },
  { id: "assa-230", brand: "ASSA", model: "Connect 230", category: "mekaniskt", note: "Fallås, 200-serien." },
  { id: "assa-231", brand: "ASSA", model: "Connect 231", category: "mekaniskt", note: "Fallås, 200-serien." },
  { id: "assa-232", brand: "ASSA", model: "Connect 232", category: "mekaniskt", note: "Fallås, 200-serien." },
  { id: "assa-2002", brand: "ASSA", model: "2002", category: "mekaniskt", note: "Klassiskt godkänt regellås, 400/2002-serien." },
  { id: "assa-2002t", brand: "ASSA", model: "2002T", category: "mekaniskt", note: "Godkänt regellås, 400/2002-serien." },
  { id: "assa-410", brand: "ASSA", model: "Connect 410", category: "mekaniskt", note: "Godkänt regellås, 400-serien." },
  { id: "assa-411", brand: "ASSA", model: "Connect 411", category: "mekaniskt", note: "Godkänt regellås, 400-serien." },
  { id: "assa-415", brand: "ASSA", model: "Connect 415", category: "mekaniskt", note: "Tvåcylinderlås." },
  { id: "assa-2500", brand: "ASSA", model: "2500", category: "mekaniskt", note: "Godkänt regellås, 500-serien." },
  { id: "assa-510", brand: "ASSA", model: "Connect 510", category: "mekaniskt", note: "Godkänt regellås, 500-serien." },
  { id: "assa-511", brand: "ASSA", model: "Connect 511", category: "mekaniskt", note: "Godkänt regellås, 500-serien." },
  { id: "assa-510m", brand: "ASSA", model: "Connect 510 med mikrobrytare", category: "mikro", note: "Godkänt regellås med lägesindikering." },
  { id: "assa-610", brand: "ASSA", model: "Connect 610", category: "mekaniskt", note: "Split spindle-lås, 600-serien." },
  { id: "assa-620", brand: "ASSA", model: "Connect 620", category: "mekaniskt", note: "Split spindle-lås, 600-serien." },
  { id: "assa-621", brand: "ASSA", model: "Connect 621", category: "mekaniskt", note: "Split spindle-lås, 600-serien." },
  { id: "assa-622", brand: "ASSA", model: "Connect 622", category: "mekaniskt", note: "Split spindle-lås, 600-serien." },
  { id: "assa-624", brand: "ASSA", model: "Connect 624", category: "mekaniskt", note: "Split spindle-lås, 600-serien." },
  { id: "assa-636", brand: "ASSA", model: "Connect 636", category: "mekaniskt", note: "Split spindle-lås, 600-serien." },
  { id: "assa-640", brand: "ASSA", model: "Connect 640", category: "mekaniskt", note: "Split spindle-lås, 600-serien." },
  { id: "assa-710", brand: "ASSA", model: "Connect 710", category: "mekaniskt", note: "Nödutrymningslås, 700-serien." },
  { id: "assa-711", brand: "ASSA", model: "Connect 711", category: "mekaniskt", note: "Nödutrymningslås, 700-serien." },
  { id: "assa-721", brand: "ASSA", model: "Connect 721", category: "mekaniskt", note: "Nödutrymningslås, 700-serien." },
  { id: "assa-722", brand: "ASSA", model: "Connect 722", category: "mekaniskt", note: "Nödutrymningslås, 700-serien." },
  { id: "assa-727", brand: "ASSA", model: "Connect 727", category: "mekaniskt", note: "Nödutrymningslås, 700-serien." },
  { id: "assa-731", brand: "ASSA", model: "Connect 731", category: "mekaniskt", note: "Nödutrymningslås, 700-serien." },
  { id: "assa-732", brand: "ASSA", model: "Connect 732", category: "mekaniskt", note: "Nödutrymningslås, 700-serien." },
  { id: "assa-740", brand: "ASSA", model: "Connect 740", category: "mekaniskt", note: "Panikutrymningslås, 700-serien." },
  { id: "assa-761", brand: "ASSA", model: "Connect 761", category: "mekaniskt", note: "Panikutrymningslås, 700-serien." },
  { id: "assa-762", brand: "ASSA", model: "Connect 762", category: "mekaniskt", note: "Panikutrymningslås, 700-serien." },
  { id: "assa-767", brand: "ASSA", model: "Connect 767", category: "mekaniskt", note: "Panikutrymningslås, 700-serien." },
  { id: "assa-772", brand: "ASSA", model: "Connect 772", category: "mekaniskt", note: "Panikutrymningslås, 700-serien." },
  { id: "assa-560", brand: "ASSA", model: "560", category: "mekaniskt", note: "Modullås, fallås." },
  { id: "assa-562", brand: "ASSA", model: "562", category: "mekaniskt", note: "Modullås, fallås." },
  { id: "assa-564", brand: "ASSA", model: "564", category: "mekaniskt", note: "Modullås, fallås." },
  { id: "assa-565", brand: "ASSA", model: "565", category: "mekaniskt", note: "Modullås, enkelt regellås." },
  { id: "assa-566", brand: "ASSA", model: "566", category: "mekaniskt", note: "Modullås, enkelt regellås." },
  { id: "assa-2000", brand: "ASSA", model: "2000", category: "mekaniskt", note: "Modullås, godkänt regellås." },
  { id: "assa-8765", brand: "ASSA", model: "8765", category: "mekaniskt", note: "Modullås, godkänt regellås." },
  { id: "assa-9787", brand: "ASSA", model: "9787", category: "mekaniskt", note: "Smalprofil, godkänt regellås." },
  { id: "assa-310m", brand: "ASSA", model: "Connect 310 med mikrobrytare", category: "mikro", note: "Mekaniskt låshus med lägesindikering." },
  { id: "assa-560m", brand: "ASSA", model: "560 med mikrobrytare", category: "mikro", note: "Mekaniskt låshus med lägesindikering." },
  { id: "assa-810s", brand: "ASSA", model: "810S", category: "eltryck", note: "Eltryckeslås." },
  { id: "assa-811s", brand: "ASSA", model: "811S", category: "eltryck", note: "Eltryckeslås, smal variant." },
  { id: "assa-813c", brand: "ASSA", model: "813C", category: "eltryck", note: "Eltryckeslås, Velox." },
  { id: "assa-815c", brand: "ASSA", model: "815C", category: "eltryck", note: "Eltryckeslås, Velox." },
  { id: "assa-820c", brand: "ASSA", model: "820C", category: "eltryck", note: "Eltryckeslås, Velox." },
  { id: "assa-825c", brand: "ASSA", model: "825C", category: "eltryck", note: "Eltryckeslås, Velox." },
  { id: "assa-835c", brand: "ASSA", model: "835C", category: "eltryck", note: "Eltryckeslås, Velox." },
  { id: "assa-840c", brand: "ASSA", model: "840C", category: "eltryck", note: "Eltryckeslås, Connect-serien." },
  { id: "assa-841c", brand: "ASSA", model: "841C", category: "eltryck", note: "Eltryckeslås för profildörrar." },
  { id: "assa-830c", brand: "ASSA", model: "830C", category: "motor", note: "Motorlås." },
  { id: "assa-831c", brand: "ASSA", model: "831C", category: "motor", note: "Motorlås." },
  { id: "assa-850", brand: "ASSA", model: "850", category: "motor", note: "Motorlås." },
  { id: "assa-851c", brand: "ASSA", model: "851C", category: "motor", note: "Motorlås." },
  { id: "assa-8100", brand: "ASSA", model: "8100 Hi-O", category: "motor", note: "Motorlås med Hi-O-bussteknik." },
  { id: "step-110", brand: "STEP", model: "STEP 110", category: "eltryck", note: "Eltryckeslås." },
  { id: "step-120", brand: "STEP", model: "STEP 120", category: "eltryck", note: "Eltryckeslås." },
  { id: "step-130", brand: "STEP", model: "STEP 130", category: "eltryck", note: "Eltryckeslås." },
  { id: "step-112", brand: "STEP", model: "STEP 112", category: "eltryck", note: "Eltryckeslås." },
  { id: "step-122", brand: "STEP", model: "STEP 122", category: "eltryck", note: "Eltryckeslås." },
  { id: "step-132", brand: "STEP", model: "STEP 132", category: "eltryck", note: "Eltryckeslås." },
  { id: "step-140", brand: "STEP", model: "STEP 140", category: "eltryck", note: "Ellås." },
  { id: "step-350", brand: "STEP", model: "STEP 350", category: "motor", note: "Motorlås." },
  { id: "step-351", brand: "STEP", model: "STEP 351", category: "motor", note: "Motorlås." },
  { id: "step-352", brand: "STEP", model: "STEP 352", category: "motor", note: "Motorlås." },
  { id: "step-550", brand: "STEP", model: "STEP 550", category: "motor", note: "Motorlås." },
  { id: "step-551", brand: "STEP", model: "STEP 551", category: "motor", note: "Motorlås." },
  { id: "step-552", brand: "STEP", model: "STEP 552", category: "motor", note: "Motorlås." },
  { id: "step-m12", brand: "STEP", model: "STEP M12", category: "mekaniskt", note: "Mekaniskt fallås." },
  { id: "step-m22", brand: "STEP", model: "STEP M22", category: "mekaniskt", note: "Mekaniskt fallås." },
  { id: "step-m32", brand: "STEP", model: "STEP M32", category: "mekaniskt", note: "Mekaniskt fallås." },
  { id: "step-m33", brand: "STEP", model: "STEP M33", category: "mekaniskt", note: "Mekaniskt fallås." },
  { id: "step-m36", brand: "STEP", model: "STEP M36", category: "mekaniskt", note: "Mekaniskt fallås." },
  { id: "step-sm22", brand: "STEP", model: "STEP SM22", category: "mekaniskt", note: "Mekaniskt fallås, smalprofil." },
  { id: "step-sm36", brand: "STEP", model: "STEP SM36", category: "mekaniskt", note: "Mekaniskt fallås, smalprofil." },
  { id: "step-h50", brand: "STEP", model: "STEP H50", category: "mekaniskt", note: "Mekaniskt hakregellås." },
  { id: "step-h51", brand: "STEP", model: "STEP H51", category: "mekaniskt", note: "Mekaniskt hakregellås." },
  { id: "step-e12", brand: "STEP", model: "STEP E12", category: "mekaniskt", note: "Mekaniskt utrymningslås." },
  { id: "step-e22", brand: "STEP", model: "STEP E22", category: "mekaniskt", note: "Mekaniskt utrymningslås." },
  { id: "step-e27", brand: "STEP", model: "STEP E27", category: "mekaniskt", note: "Mekaniskt utrymningslås." },
  { id: "step-e32", brand: "STEP", model: "STEP E32", category: "mekaniskt", note: "Mekaniskt utrymningslås." },
  { id: "step-e37", brand: "STEP", model: "STEP E37", category: "mekaniskt", note: "Mekaniskt utrymningslås." },
  { id: "step-se22", brand: "STEP", model: "STEP SE22", category: "mekaniskt", note: "Mekaniskt utrymningslås, smalprofil." },
  { id: "step-se27", brand: "STEP", model: "STEP SE27", category: "mekaniskt", note: "Mekaniskt utrymningslås, smalprofil." },
  { id: "step-se36", brand: "STEP", model: "STEP SE36", category: "mekaniskt", note: "Mekaniskt utrymningslås, smalprofil." },
  { id: "step-se37", brand: "STEP", model: "STEP SE37", category: "mekaniskt", note: "Mekaniskt utrymningslås, smalprofil." },
  { id: "safetron-sl620", brand: "SAFETRON", model: "SL620", category: "eltryck", note: "Eltryckeslås i 600-serien." },
  { id: "safetron-sl630", brand: "SAFETRON", model: "SL630", category: "eltryck", note: "Eltryckeslås i 600-serien." },
];

/** Verifierade direktlänkar till tillverkarens manual-PDF (hämtade från steplock.com produktsidor). */
const CONNECT_PDF = "https://www.assaabloy.com/se/sv/documents/support-service/nedladdningscenter/product-information/installationsanvisningar/lashus-slutbleck/M2586.1502%20Monteringsanvisning%20Connect%20hakr.%20sv-eng%20MK21-05-07.pdf";
const MODUL_PDF = "https://www.assaabloy.com/se/sv/documents/support-service/nedladdningscenter/product-information/installationsanvisningar/lashus-slutbleck/Monteringsanvisning%20modullas.pdf";

const MANUAL_PDF: Record<string, string> = {
  // ASSA ABLOY officiella PDF:er (assaabloy.com nedladdningscenter)
  "Connect 310": "https://www.assaabloy.com/se/sv/documents/support-service/nedladdningscenter/product-information/installationsanvisningar/lashus-slutbleck/M2586.1502%20Monteringsanvisning%20Connect%20hakr.%20sv-eng%20MK21-05-07.pdf",
  "Connect 410": "https://www.assaabloy.com/se/sv/documents/support-service/nedladdningscenter/product-information/installationsanvisningar/lashus-slutbleck/M2586.1502%20Monteringsanvisning%20Connect%20hakr.%20sv-eng%20MK21-05-07.pdf",
  "Connect 311": CONNECT_PDF,
  "Connect 411": CONNECT_PDF,
  "562": MODUL_PDF,
  "564": MODUL_PDF,
  "566": MODUL_PDF,
  "2000": MODUL_PDF,
  "2002": "https://www.assaabloy.com/se/sv/documents/support-service/nedladdningscenter/product-information/installationsanvisningar/lashus-slutbleck/M2586.1502%20Monteringsanvisning%20Connect%20hakr.%20sv-eng%20MK21-05-07.pdf",
  "560": "https://www.assaabloy.com/se/sv/documents/support-service/nedladdningscenter/product-information/installationsanvisningar/lashus-slutbleck/Monteringsanvisning%20modullas.pdf",
  "565": "https://www.assaabloy.com/se/sv/documents/support-service/nedladdningscenter/product-information/installationsanvisningar/lashus-slutbleck/Monteringsanvisning%20modullas.pdf",
  "840C": "https://static-mpc-spear-production.assaabloy.com/asfe/Fetchfile.aspx?dl=1&id=48426",
  "841C": "https://static-mpc-spear-production.assaabloy.com/asfe/Fetchfile.aspx?dl=1&id=48426",
  "850": "https://static-mpc-spear-production.assaabloy.com/asfe/Fetchfile.aspx?dl=1&id=48426",
  "8100 Hi-O": "https://static-mpc-spear-production.assaabloy.com/asfe/Fetchfile.aspx?dl=1&id=45018",
  "8765": "https://www.assaabloy.com/se/sv/documents/support-service/nedladdningscenter/product-information/installationsanvisningar/lashus-slutbleck/Monteringsanvisning%20modullas.pdf",
  "STEP 110": "https://api.steplock.com/medias/Manual-STEP-110-120.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDI0MDUzMzd8YXBwbGljYXRpb24vcGRmfGFHUXhMMmhpTnk4NE56azJOVFkyTlRnMU16YzBMMDFoYm5WaGJGOVRWRVZRWHpFeE1GOHhNakF1Y0dSbXw2ZjFlNjFkY2Y4NmYzMTA5ODY1MjA3YjEyNzE1ZTE1MWMxZjI3ZWU3OTUyMDliOTkxMDA4YzFmNTczNDZiMTUz",
  "STEP 112": "https://api.steplock.com/medias/Manual-STEP-110-120.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDI0MDUzMzd8YXBwbGljYXRpb24vcGRmfGFHUXhMMmhpTnk4NE56azJOVFkyTlRnMU16YzBMMDFoYm5WaGJGOVRWRVZRWHpFeE1GOHhNakF1Y0dSbXw2ZjFlNjFkY2Y4NmYzMTA5ODY1MjA3YjEyNzE1ZTE1MWMxZjI3ZWU3OTUyMDliOTkxMDA4YzFmNTczNDZiMTUz",
  "STEP 120": "https://api.steplock.com/medias/Manual-STEP-110-120.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDI0MDUzMzd8YXBwbGljYXRpb24vcGRmfGFHUXhMMmhpTnk4NE56azJOVFkyTlRnMU16YzBMMDFoYm5WaGJGOVRWRVZRWHpFeE1GOHhNakF1Y0dSbXw2ZjFlNjFkY2Y4NmYzMTA5ODY1MjA3YjEyNzE1ZTE1MWMxZjI3ZWU3OTUyMDliOTkxMDA4YzFmNTczNDZiMTUz",
  "STEP 122": "https://api.steplock.com/medias/Manual-STEP-110-120.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDI0MDUzMzd8YXBwbGljYXRpb24vcGRmfGFHUXhMMmhpTnk4NE56azJOVFkyTlRnMU16YzBMMDFoYm5WaGJGOVRWRVZRWHpFeE1GOHhNakF1Y0dSbXw2ZjFlNjFkY2Y4NmYzMTA5ODY1MjA3YjEyNzE1ZTE1MWMxZjI3ZWU3OTUyMDliOTkxMDA4YzFmNTczNDZiMTUz",
  "STEP 130": "https://api.steplock.com/medias/Installationsanvisning-STEP-130-utga-va-11-webb.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDIyMjYxODZ8YXBwbGljYXRpb24vcGRmfGFHTTRMMmd6WVM4NE9UQTVOVGM0TURjMk1Ua3dMMGx1YzNSaGJHeGhkR2x2Ym5OaGJuWnBjMjVwYm1jZ1UxUkZVQ0F4TXpCZmRYUm5ZY3lLZG1FZ01URmZkMlZpWWk1d1pHWXxiYzI5MWJiNzNlNzFkN2U3YmRlY2I3YWFkODcwZWEzZWZlYzQyNGQ1N2QxNGJiOGNkMWYzZmMwYjk2OWRmNzUw",
  "STEP 132": "https://api.steplock.com/medias/Installationsanvisning-STEP-130-utga-va-11-webb.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDIyMjYxODZ8YXBwbGljYXRpb24vcGRmfGFHTTRMMmd6WVM4NE9UQTVOVGM0TURjMk1Ua3dMMGx1YzNSaGJHeGhkR2x2Ym5OaGJuWnBjMjVwYm1jZ1UxUkZVQ0F4TXpCZmRYUm5ZY3lLZG1FZ01URmZkMlZpWWk1d1pHWXxiYzI5MWJiNzNlNzFkN2U3YmRlY2I3YWFkODcwZWEzZWZlYzQyNGQ1N2QxNGJiOGNkMWYzZmMwYjk2OWRmNzUw",
  "STEP 140": "https://api.steplock.com/medias/Manual-STEP-140.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDE5MjM4Mzl8YXBwbGljYXRpb24vcGRmfGFEQXlMMmhoWlM4NE56azJOVFkyT0RRM05URTRMMDFoYm5WaGJGOVRWRVZRWHpFME1DNXdaR1l8MTlhNGIxOGZhYWUxMzFhMGE2NjBhNjdlNmU4OTFlZDFkNDE2OTkyNThlZGE3MzJiMDFmODQ4NDQwNTZjZmE2Zg",
  "STEP 350": "https://api.steplock.com/medias/STEP-motorla-s-300-serien-OSDP-quickguide-2025-utg.7-SV.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDI4OTgxNTh8YXBwbGljYXRpb24vcGRmfGFHUXlMMmhqTUM4NE9UQXlOalUwTURrNU5EZzJMMU5VUlZBZ2JXOTBiM0pzWWN5S2N5QXpNREF0YzJWeWFXVnVYMDlUUkZCZmNYVnBZMnRuZFdsa1pWOHlNREkxWDNWMFp5NDNYMU5XTG5Ca1pnfDZiOTcwZDcyODkzZjFkMzAyMGM2MzM5OWI4MjczZTVhMjMwZWU1ODEyM2Q1NzJlYzkwY2E2Yjg0ODU5YTBmZTM",
  "STEP 351": "https://api.steplock.com/medias/STEP-motorla-s-300-serien-ST500C-OSDP-manual-2026-utg.8-SV.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDUzNzk2NzR8YXBwbGljYXRpb24vcGRmfGFHVXhMMmhrTXk4NE9UQXlOemcyTURnNE9Ua3dMMU5VUlZBZ2JXOTBiM0pzWWN5S2N5QXpNREF0YzJWeWFXVnVYMU5VTlRBd1ExOVBVMFJRWDIxaGJuVmhiRjh5TURJMlgzVjBaeTQ0WDFOV0xuQmtaZ3wyZTJkMTI5NWRiZWE3ZmI5MGFjMzliYmNmNTJiN2M0Y2ZhZGMxYTcxYjA5NTVkNTdjMTZiNWE5OGI4OTI5YzNl",
  "STEP 352": "https://api.steplock.com/medias/STEP-motorla-s-300-serien-OSDP-quickguide-2025-utg.7-SV.pdf?context=bWFzdGVyfHByb2R1Y3RNYW51YWxzfDI4OTgxNTh8YXBwbGljYXRpb24vcGRmfGFHUXlMMmhqTUM4NE9UQXlOalUwTURrNU5EZzJMMU5VUlZBZ2JXOTBiM0pzWWN5S2N5QXpNREF0YzJWeWFXVnVYMDlUUkZCZmNYVnBZMnRuZFdsa1pWOHlNREkxWDNWMFp5NDNYMU5XTG5Ca1pnfDZiOTcwZDcyODkzZjFkMzAyMGM2MzM5OWI4MjczZTVhMjMwZWU1ODEyM2Q1NzJlYzkwY2E2Yjg0ODU5YTBmZTM",
  // SAFETRON officiella installationsanvisningar (safetron.com filarkiv)
  "SL620": "https://www.safetron.com/pdf/manual/manual-eltryckeslas-sl620.pdf",
  "SL630": "https://www.safetron.com/pdf/manual/manual-eltryckeslas-sl630.pdf",
};

/** Per-id-överstyrning, t.ex. mikrobrytarvarianter som har eget kopplingsschema. */
const MANUAL_PDF_BY_ID: Record<string, string> = {
  "assa-310m": "https://www.assaabloy.com/se/sv/documents/support-service/nedladdningscenter/product-information/mikrobrytare-lashus/Tabell%20funktionsbeskrivning%20mikrobrytare.pdf",
  "assa-560m": "https://www.assaabloy.com/se/sv/documents/support-service/nedladdningscenter/product-information/mikrobrytare-lashus/Tabell%20funktionsbeskrivning%20mikrobrytare.pdf",
};

export function directManualPdf(lock: LockCase): string | undefined {
  if (MANUAL_PDF_BY_ID[lock.id]) return MANUAL_PDF_BY_ID[lock.id];
  return MANUAL_PDF[lock.model.replace(/ med mikrobrytare$/, "")];
}

export function hasDirectManual(lock: LockCase): boolean {
  return directManualPdf(lock) !== undefined;
}

/** Direkt till manualen om verifierad länk finns, annars tillverkarens produktsida/sök. */
export function manualSearchUrl(lock: LockCase): string {
  // PDF:er går via appens egen route (STEP:s server skickar en CSP som ger vit sida i vissa webbläsare).
  if (directManualPdf(lock)) return `/api/public/manual/${lock.id}`;
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
