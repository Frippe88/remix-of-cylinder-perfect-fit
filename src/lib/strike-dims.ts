// Måttstyrd stolpsökning – ren, deterministisk matchning (testad i strike-dims.test.ts).
// Måtten är yttermått (höjd × bredd) och plösmått (djup) enligt STEP:s måttskisser.

export interface StrikeDim {
  article: string;
  heightMm: number; // stolpens höjd
  widthMm: number; // stolpens bredd
  depthMm: number; // plösmått = hur djupt urtaget minst måste vara
  shape: "plan" | "vinklad";
  fits: string; // vilket elslutbleck stolpen är till för
  note?: string;
}

export const STRIKE_DIMS: StrikeDim[] = [
  // Plan stolpe, samma yttermått som ASSA 1487-serien (200×40)
  { article: "ST4009-13", heightMm: 200, widthMm: 40, depthMm: 13, shape: "plan", fits: "STEP 40/90/48/98", note: "Samma yttermått som slutbleck 1487-1" },
  { article: "ST4009-16", heightMm: 200, widthMm: 40, depthMm: 16, shape: "plan", fits: "STEP 40/90/48/98", note: "Samma yttermått som slutbleck 1487-2" },
  { article: "ST4009-20", heightMm: 200, widthMm: 40, depthMm: 20, shape: "plan", fits: "STEP 40/90/48/98", note: "Samma yttermått som slutbleck 1487-3" },
  { article: "ST4009-21", heightMm: 200, widthMm: 40, depthMm: 21, shape: "plan", fits: "STEP 40/90/48/98", note: "Samma yttermått som slutbleck 1487-4" },
  { article: "ST4005-13", heightMm: 200, widthMm: 40, depthMm: 13, shape: "plan", fits: "STEP 40/90/48/98" },
  { article: "ST4005-15", heightMm: 200, widthMm: 40, depthMm: 15, shape: "plan", fits: "STEP 40/90/48/98" },
  { article: "ST4005-20", heightMm: 200, widthMm: 40, depthMm: 20, shape: "plan", fits: "STEP 40/90/48/98" },
  { article: "ST4005-21", heightMm: 200, widthMm: 40, depthMm: 21, shape: "plan", fits: "STEP 40/90/48/98" },
  // Vinklade stolpar 245×40
  { article: "ST4002-10", heightMm: 245, widthMm: 40, depthMm: 10, shape: "vinklad", fits: "STEP 40/90/48/98" },
  { article: "ST4002-13", heightMm: 245, widthMm: 40, depthMm: 13, shape: "vinklad", fits: "STEP 40/90/48/98", note: "Motsvarar ST6514" },
  { article: "ST4002-15", heightMm: 245, widthMm: 40, depthMm: 15, shape: "vinklad", fits: "STEP 40/90/48/98", note: "Motsvarar ST6504/730" },
  { article: "ST4002-17", heightMm: 245, widthMm: 40, depthMm: 17, shape: "vinklad", fits: "STEP 40/90/48/98" },
  { article: "ST4001-10", heightMm: 245, widthMm: 40, depthMm: 10, shape: "vinklad", fits: "STEP 40/90/48/98" },
  { article: "ST4001-13", heightMm: 245, widthMm: 40, depthMm: 13, shape: "vinklad", fits: "STEP 40/90/48/98" },
  { article: "ST4001-15", heightMm: 245, widthMm: 40, depthMm: 15, shape: "vinklad", fits: "STEP 40/90/48/98" },
  { article: "ST4001-17", heightMm: 245, widthMm: 40, depthMm: 17, shape: "vinklad", fits: "STEP 40/90/48/98" },
  { article: "ST4001-20", heightMm: 245, widthMm: 40, depthMm: 20, shape: "vinklad", fits: "STEP 40/90/48/98" },
  { article: "ST4001-26", heightMm: 245, widthMm: 40, depthMm: 26, shape: "vinklad", fits: "STEP 40/90/48/98" },
  { article: "ST4003-12", heightMm: 245, widthMm: 40, depthMm: 12, shape: "vinklad", fits: "STEP 40/90/48/98" },
  { article: "ST4003-15", heightMm: 245, widthMm: 40, depthMm: 15, shape: "vinklad", fits: "STEP 40/90/48/98" },
  { article: "ST4003-21", heightMm: 245, widthMm: 40, depthMm: 21, shape: "vinklad", fits: "STEP 40/90/48/98" },
  // Mekaniska slutbleck (utan elslutbleck) – ASSA 1487-serien, 200×40
  { article: "1487-1", heightMm: 200, widthMm: 40, depthMm: 13, shape: "plan", fits: "Mekaniskt slutbleck (ASSA)" },
  { article: "1487-2", heightMm: 200, widthMm: 40, depthMm: 16, shape: "plan", fits: "Mekaniskt slutbleck (ASSA)" },
  { article: "1487-3", heightMm: 200, widthMm: 40, depthMm: 20, shape: "plan", fits: "Mekaniskt slutbleck (ASSA)" },
  { article: "1487-4", heightMm: 200, widthMm: 40, depthMm: 21, shape: "plan", fits: "Mekaniskt slutbleck (ASSA)" },
];

export interface DimMatch extends StrikeDim {
  /** Sammanlagd marginal i mm (lägre = tätare passform). */
  slackMm: number;
}

/**
 * Hittar stolpar som ryms i urtaget: stolpens höjd/bredd får inte vara större
 * än urtaget (+2 mm marginal uppåt räknas som passform), och urtagets djup måste
 * räcka till plösmåttet. Sorteras på tätast passform först.
 */
export function matchByDimensions(heightMm: number, widthMm: number, depthMm: number): DimMatch[] {
  if (!(heightMm > 0) || !(widthMm > 0) || !(depthMm > 0)) return [];
  return STRIKE_DIMS.filter(
    (s) => s.heightMm <= heightMm + 2 && s.widthMm <= widthMm + 2 && s.depthMm <= depthMm,
  )
    .map((s) => ({
      ...s,
      slackMm: Math.max(0, heightMm - s.heightMm) + Math.max(0, widthMm - s.widthMm) + (depthMm - s.depthMm),
    }))
    .sort((a, b) => a.slackMm - b.slackMm || a.article.localeCompare(b.article, "sv"));
}
