// Stolpväljare – ren, deterministisk uppslagning i STEP:s stolpguide (src/lib/strike-data.ts).
import { PROFILE_ROWS, WOOD_STEEL_ROWS } from "./strike-data";

/** Kolumner i tabellen för trä- och stålkarm. */
export const WOOD_COLUMNS = [
  { id: "step30", label: "STEP 30 Preload", group: "STEP", target: true },
  { id: "step40", label: "STEP 40/90/48/98 Preload, STEP 90 Release", group: "STEP", target: true },
  { id: "step92", label: "STEP 92 Preload / Release", group: "STEP", target: true },
  { id: "step60", label: "STEP 60 Silent", group: "STEP", target: true },
  { id: "solidEnkla", label: "Solid enkla", group: "Solid", target: false },
  { id: "solidStd", label: "Solid standard", group: "Solid", target: false },
  { id: "solidXtra", label: "Solid extrakraftiga", group: "Solid", target: false },
  { id: "assa900", label: "ASSA 900", group: "ASSA", target: false },
  { id: "mek", label: "Mekaniskt slutbleck (ASSA 1264/1887/1487)", group: "Mekaniskt", target: false },
] as const;

export const PROFILE_COLUMNS = [
  { id: "step30", label: "STEP 30 Preload" },
  { id: "step40", label: "STEP 40/90/48/98 Preload, STEP 90 Release" },
  { id: "step92", label: "STEP 92 Preload / Release" },
  { id: "step60", label: "STEP 60 Silent" },
  { id: "step18", label: "STEP 18 Secure" },
  { id: "step28", label: "STEP 28E Secure" },
] as const;

export type WoodColumnId = (typeof WOOD_COLUMNS)[number]["id"];

const clean = (s: string) => s.replace(/\*/g, "").trim();
/** "ST4041/4066" → ["ST4041","ST4066"], "730T/732T" → ["730T","732T"]. */
export function splitCell(cell: string): string[] {
  const parts = clean(cell).split("/");
  const first = parts[0];
  const prefix = first.match(/^[A-Z]+/)?.[0] ?? "";
  return parts.map((p) => (prefix && /^\d/.test(p) ? prefix + p : p));
}

export interface ExistingOption {
  value: string; // unikt: kolumn|artikel
  article: string;
  column: WoodColumnId;
  angled: boolean; // * = motsvarar mekaniskt slutbleck med vinkel i framkant
}

/** Alla befintliga produkter man kan ha i karmen i dag, grupperade per kolumn. */
export function existingOptions(): ExistingOption[] {
  const out: ExistingOption[] = [];
  const seen = new Set<string>();
  WOOD_STEEL_ROWS.forEach((row) =>
    row.forEach((cell, ci) => {
      if (!cell) return;
      const column = WOOD_COLUMNS[ci].id;
      const value = `${column}|${cell}`;
      if (seen.has(value)) return;
      seen.add(value);
      out.push({ value, article: clean(cell), column, angled: cell.includes("*") });
    }),
  );
  return out;
}

export interface WoodResult {
  target: string;
  angled: boolean;
  equivalents: { column: WoodColumnId; article: string }[];
}

/** Ger stolpe/stolpar för målmodellen som passar samma urtag som den befintliga produkten. */
export function findByExisting(existingValue: string, target: WoodColumnId): WoodResult[] {
  const [col, cell] = existingValue.split("|");
  const ci = WOOD_COLUMNS.findIndex((c) => c.id === col);
  const ti = WOOD_COLUMNS.findIndex((c) => c.id === target);
  if (ci < 0 || ti < 0) return [];
  const results: WoodResult[] = [];
  const seen = new Set<string>();
  for (const row of WOOD_STEEL_ROWS) {
    if (row[ci] !== cell) continue;
    const t = row[ti];
    if (!t || seen.has(t)) continue;
    seen.add(t);
    results.push({
      target: clean(t),
      angled: t.includes("*") || (row[8]?.includes("*") ?? false),
      equivalents: row
        .map((c, i) => (c && i !== ti && i !== ci ? { column: WOOD_COLUMNS[i].id, article: clean(c) } : null))
        .filter((x): x is { column: WoodColumnId; article: string } => x !== null),
    });
  }
  return results;
}

export const PROFILES = PROFILE_ROWS.map((r) => r[0]);

export function findByProfile(profile: string): { column: string; article: string }[] {
  const row = PROFILE_ROWS.find((r) => r[0] === profile);
  if (!row) return [];
  return PROFILE_COLUMNS.map((c, i) => ({ column: c.label, article: row[i + 1] })).filter(
    (x): x is { column: string; article: string } => !!x.article,
  );
}
