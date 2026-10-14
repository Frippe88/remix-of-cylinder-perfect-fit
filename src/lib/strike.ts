// Stolpväljare – ren, deterministisk matchning mot en stolptabell.
// OBS: Tabellen är EXEMPELDATA och måste verifieras mot STEP:s och ASSA ABLOY:s kataloger.

export type Brand = "STEP" | "ASSA";
export type Kind = "el" | "mekanisk";
export type Profile = "plan" | "vinkel";

export interface Strike {
  id: string;
  brand: Brand;
  name: string;
  kind: Kind;
  profile: Profile;
  cutoutLength: number; // urtagets längd (höjd) i mm
  cutoutWidth: number; // urtagets bredd i mm
  note?: string;
  verified: boolean;
}

export const STRIKES: Strike[] = [
  { id: "step-plan-215", brand: "STEP", name: "Planstolpe 215 (exempel)", kind: "el", profile: "plan", cutoutLength: 215, cutoutWidth: 26, verified: false },
  { id: "step-vinkel-215", brand: "STEP", name: "Vinkelstolpe 215 (exempel)", kind: "el", profile: "vinkel", cutoutLength: 215, cutoutWidth: 26, verified: false },
  { id: "step-plan-200", brand: "STEP", name: "Planstolpe 200 (exempel)", kind: "el", profile: "plan", cutoutLength: 200, cutoutWidth: 26, verified: false },
  { id: "step-mek-plan-225", brand: "STEP", name: "Mekanisk planstolpe 225 (exempel)", kind: "mekanisk", profile: "plan", cutoutLength: 225, cutoutWidth: 24, verified: false },
  { id: "assa-el-plan-225", brand: "ASSA", name: "Elslutbleck planstolpe 225 (exempel)", kind: "el", profile: "plan", cutoutLength: 225, cutoutWidth: 26, verified: false },
  { id: "assa-el-vinkel-200", brand: "ASSA", name: "Elslutbleck vinkelstolpe 200 (exempel)", kind: "el", profile: "vinkel", cutoutLength: 200, cutoutWidth: 26, verified: false },
  { id: "assa-mek-vinkel-150", brand: "ASSA", name: "Slutbleck vinkel 150 (exempel)", kind: "mekanisk", profile: "vinkel", cutoutLength: 150, cutoutWidth: 22, verified: false },
  { id: "assa-mek-plan-200", brand: "ASSA", name: "Slutbleck plan 200 (exempel)", kind: "mekanisk", profile: "plan", cutoutLength: 200, cutoutWidth: 24, verified: false },
];

export const LENGTH_TOLERANCE_MM = 2;
export const WIDTH_TOLERANCE_MM = 1;

export interface StrikeQuery {
  brands: Brand[];
  kind: Kind;
  profile: Profile | "alla";
  length: number;
  width: number | null;
}

export interface StrikeMatch {
  strike: Strike;
  lengthDiff: number; // stolpens urtag − uppmätt
  widthDiff: number | null;
}

export function findStrikes(q: StrikeQuery, list: Strike[] = STRIKES): StrikeMatch[] {
  return list
    .filter((s) => q.brands.includes(s.brand) && s.kind === q.kind && (q.profile === "alla" || s.profile === q.profile))
    .map((s) => ({
      strike: s,
      lengthDiff: s.cutoutLength - q.length,
      widthDiff: q.width == null ? null : s.cutoutWidth - q.width,
    }))
    .filter((m) => Math.abs(m.lengthDiff) <= LENGTH_TOLERANCE_MM && (m.widthDiff == null || Math.abs(m.widthDiff) <= WIDTH_TOLERANCE_MM))
    .sort(
      (a, b) =>
        Math.abs(a.lengthDiff) - Math.abs(b.lengthDiff) ||
        Math.abs(a.widthDiff ?? 0) - Math.abs(b.widthDiff ?? 0) ||
        a.strike.id.localeCompare(b.strike.id),
    );
}
