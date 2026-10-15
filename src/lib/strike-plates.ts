// Stolpväljare – ren, deterministisk matchning (testad i strike-plates.test.ts).
// Data från STEP:s officiella Stolpguide och ASSA 1487-serien. Verifiera alltid mot tillverkarens måttskiss.

export interface StrikePlate {
  article: string;
  heightMm: number;
  widthMm: number;
  ploMm: number; // plösmått
  shape: "plan" | "vinklad";
  fits: string;
  electric: boolean;
  note?: string;
}

export const STRIKE_PLATES: StrikePlate[] = [
export const STRIKE_DIMS: StrikeDim[] = [
  // Plan stolpe, samma yttermått som ASSA 1487-serien (200×40)
  { article: "ST4009-13", heightMm: 200, widthMm: 40, ploMm: 13, shape: "plan", fits: "Elslutbleck STEP 40/90/48/98", electric: true, note: "Samma yttermått som slutbleck 1487-1" },
  { article: "ST4009-16", heightMm: 200, widthMm: 40, ploMm: 16, shape: "plan", fits: "Elslutbleck STEP 40/90/48/98", electric: true, note: "Samma yttermått som slutbleck 1487-2" },
  { article: "ST4009-20", heightMm: 200, widthMm: 40, ploMm: 20, shape: "plan", fits: "Elslutbleck STEP 40/90/48/98", electric: true, note: "Samma yttermått som slutbleck 1487-3" },
  { article: "ST4009-21", heightMm: 200, widthMm: 40, ploMm: 21, shape: "plan", fits: "Elslutbleck STEP 40/90/48/98", electric: true, note: "Samma yttermått som slutbleck 1487-4" },
  { article: "ST4005-13", heightMm: 200, widthMm: 40, ploMm: 13, shape: "plan", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4005-15", heightMm: 200, widthMm: 40, ploMm: 15, shape: "plan", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4005-20", heightMm: 200, widthMm: 40, ploMm: 20, shape: "plan", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4005-21", heightMm: 200, widthMm: 40, ploMm: 21, shape: "plan", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  // Vinklade stolpar 245×40
  { article: "ST4002-10", heightMm: 245, widthMm: 40, ploMm: 10, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4002-13", heightMm: 245, widthMm: 40, ploMm: 13, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true, note: "Motsvarar ST6514" },
  { article: "ST4002-15", heightMm: 245, widthMm: 40, ploMm: 15, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true, note: "Motsvarar ST6504/730" },
  { article: "ST4002-17", heightMm: 245, widthMm: 40, ploMm: 17, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4001-10", heightMm: 245, widthMm: 40, ploMm: 10, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4001-13", heightMm: 245, widthMm: 40, ploMm: 13, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4001-15", heightMm: 245, widthMm: 40, ploMm: 15, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4001-17", heightMm: 245, widthMm: 40, ploMm: 17, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4001-20", heightMm: 245, widthMm: 40, ploMm: 20, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4001-26", heightMm: 245, widthMm: 40, ploMm: 26, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4003-12", heightMm: 245, widthMm: 40, ploMm: 12, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4003-15", heightMm: 245, widthMm: 40, ploMm: 15, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  { article: "ST4003-21", heightMm: 245, widthMm: 40, ploMm: 21, shape: "vinklad", fits: "Elslutbleck STEP 40/90/48/98", electric: true },
  // Mekaniska slutbleck (utan elslutbleck) – ASSA 1487-serien, 200×40
  { article: "1487-1", heightMm: 200, widthMm: 40, ploMm: 13, shape: "plan", fits: "Mekaniskt slutbleck (ASSA)", electric: false },
  { article: "1487-2", heightMm: 200, widthMm: 40, ploMm: 16, shape: "plan", fits: "Mekaniskt slutbleck (ASSA)", electric: false },


export type StrikeKind = "alla" | "el" | "mekanisk";

export interface StrikeQuery {
  heightMm: number;
  widthMm: number;
  ploMm?: number; // önskat plösmått, valfritt
  kind?: StrikeKind;
}

export interface StrikeMatch extends StrikePlate {
  heightSlackMm: number;
  widthSlackMm: number;
  ploDiffMm: number | null;
}

/** Stolpen ska rymmas i urtaget (max +2 mm över), sorteras på exakt plös först, sedan tätast passform. */
export function matchStrikePlates(q: StrikeQuery, list: StrikePlate[] = STRIKE_PLATES): StrikeMatch[] {
  if (!(q.heightMm > 0) || !(q.widthMm > 0)) return [];
  const kind = q.kind ?? "alla";
  const plo = q.ploMm && q.ploMm > 0 ? q.ploMm : null;
  return list
    .filter((s) => s.heightMm <= q.heightMm + 2 && s.widthMm <= q.widthMm + 2)
    .filter((s) => kind === "alla" || (kind === "el") === s.electric)
    .map((s) => ({
      ...s,
      heightSlackMm: q.heightMm - s.heightMm,
      widthSlackMm: q.widthMm - s.widthMm,
      ploDiffMm: plo === null ? null : s.ploMm - plo,
    }))
    .sort(
      (a, b) =>
        Math.abs(a.ploDiffMm ?? 0) - Math.abs(b.ploDiffMm ?? 0) ||
        Math.abs(a.heightSlackMm) + Math.abs(a.widthSlackMm) - (Math.abs(b.heightSlackMm) + Math.abs(b.widthSlackMm)) ||
        a.article.localeCompare(b.article, "sv"),
    );
}
