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
  { article: "1487-3", heightMm: 200, widthMm: 40, ploMm: 20, shape: "plan", fits: "Mekaniskt slutbleck (ASSA)", electric: false },
  { article: "1487-4", heightMm: 200, widthMm: 40, ploMm: 21, shape: "plan", fits: "Mekaniskt slutbleck (ASSA)", electric: false },
  ...ASSA_ELECTRIC(),
];

// ASSA ABLOY monteringsstolpar för elslutbleck – ASSA:s översättningstabell (900-serien) och produktblad för 700-serien (Solid standard).
function ASSA_ELECTRIC(): StrikePlate[] {
  type Row = [string, number, number, number, StrikePlate["shape"], string, string?];
  const s700 = "ASSA elslutbleck 700-serien (Solid standard)";
  const s900 = "ASSA elslutbleck 900-serien";
  const rows: Row[] = [
    ["730", 245, 40, 15, "vinklad", `${s700} – trä/stål, förreglat enkelfallås`, "Motsvarar STEP ST6504"],
    ["731-17", 245, 42, 17, "vinklad", `${s700} – stål/aluminium`],
    ["731-20", 245, 45, 20, "vinklad", `${s700} – stål/aluminium`],
    ["731-26", 245, 51, 26, "vinklad", `${s700} – stål/aluminium`],
    ["732", 245, 40, 15, "plan", `${s700} – trä/stål/aluminium, förreglat enkelfallås`],
    ["733-17", 245, 42, 17, "plan", `${s700} – stål/aluminium`],
    ["733-20", 245, 45, 20, "plan", `${s700} – stål/aluminium`],
    ["733-26", 245, 51, 26, "plan", `${s700} – stål/aluminium`],
    ["930", 245, 40, 15, "vinklad", `${s900} – trä/stål`, "Motsvarar STEP ST6504"],
    ["930T", 245, 40, 15, "vinklad", `${s900} – trä, runda hörn`, "Motsvarar STEP ST6515"],
    ["930-9,5", 245, 34.5, 9.5, "vinklad", `${s900} – specialplös 9,5 mm`, "Motsvarar STEP ST6507"],
    ["930-13", 245, 40, 13, "plan", `${s900} – stålprofil 35000/75000`],
    ["931-17", 245, 42, 17, "vinklad", `${s900} – stål/aluminium`, "Motsvarar STEP ST6558"],
    ["931-20", 245, 45, 20, "vinklad", `${s900} – stål/aluminium`, "Motsvarar STEP ST6559"],
    ["931-26", 245, 51, 26, "vinklad", `${s900} – stål/aluminium`, "Motsvarar STEP ST6510"],
    ["932", 245, 40, 15, "plan", `${s900} – trä/stål`, "Motsvarar STEP ST6545"],
    ["932T", 245, 40, 15, "plan", `${s900} – trä, runda hörn`],
    ["933-17", 245, 42, 17, "plan", `${s900} – stål/aluminium`],
    ["933-20", 245, 45, 20, "plan", `${s900} – stål/aluminium`],
    ["933-26", 245, 51, 26, "plan", `${s900} – stål/aluminium`],
    ["9487-2", 200, 40, 16.5, "plan", `${s900} – ersätter slutbleck 1487-2`],
    ["9487-3", 200, 43.5, 20, "plan", `${s900} – ersätter slutbleck 1487-3`],
    ["9487-4", 200, 45, 21.5, "plan", `${s900} – ersätter slutbleck 1487-4`],
    ["9487-10", 200, 57.6, 22.3, "plan", `${s900} – Sapa 2074`, "Motsvarar STEP ST6502"],
    ["986", 200, 50, 27.9, "plan", `${s900} – Sapa 2086`, "Motsvarar STEP ST6586"],
    ["940", 245, 39.2, 15, "plan", `${s900} – Sapa 2050`, "Motsvarar STEP ST6585"],
    ["942", 245, 41.2, 18, "plan", `${s900} – Sapa 2060`, "Motsvarar STEP ST6509"],
    ["950-S", 230, 29, 10.5, "plan", `${s900} – Schüco ADS 50 NI`],
    ["965-S", 245, 54.5, 28, "plan", `${s900} – Schüco ADS 65 HD`],
    ["970", 245, 59.5, 31.5, "plan", `${s900} – Schüco ADS 70`, "Motsvarar STEP ST6517"],
    ["975-S", 245, 64.5, 37.5, "plan", `${s900} – Schüco ADS 75 HD / W77`, "Motsvarar STEP ST6519"],
    ["980", 245, 50, 24, "plan", `${s900} – Schüco ADS 80`, "Motsvarar STEP ST6503"],
    ["965W", 245, 40, 12.5, "plan", `${s900} – Wicona 65 / Connect`],
    ["965WM", 245, 40, 11.5, "plan", `${s900} – Wicona 65 / modullås`, "Motsvarar STEP ST6574"],
    ["975W", 245, 50, 17.5, "plan", `${s900} – Wicona 75 / Connect`, "Motsvarar STEP ST6575"],
    ["975WM", 245, 50, 16.5, "plan", `${s900} – Wicona 75 / modullås`],
    ["917W", 245, 42, 17, "plan", `${s900} – Wicstyle 77 FP`],
    ["946W", 245, 50, 25.5, "plan", `${s900} – Wicstyle 65N / Connect`],
    ["946WM", 245, 50, 24.5, "plan", `${s900} – Wicstyle 65N / modullås`],
    ["966", 230, 55.5, 26, "plan", `${s900} – Preconal system 66`],
    ["956", 200, 55, 19, "plan", `${s900} – stålprofil 56500/76500`],
    ["957", 200, 60, 21, "plan", `${s900} – stålprofil 57000/77000`],
    ["959", 200, 80, 30.5, "plan", `${s900} – stålprofil 59000/79000`],
  ];
  return rows.map(([article, heightMm, widthMm, ploMm, shape, fits, note]) => ({
    article, heightMm, widthMm, ploMm, shape, fits, electric: true, ...(note ? { note } : {}),
  }));
}

export type StrikeBrand = "alla" | "STEP" | "ASSA";
export const strikeBrand = (s: StrikePlate): "STEP" | "ASSA" => (s.article.startsWith("ST") ? "STEP" : "ASSA");


export type StrikeKind = "alla" | "el" | "mekanisk";

export interface StrikeQuery {
  heightMm: number;
  widthMm: number;
  ploMm?: number | undefined; // önskat plösmått, valfritt
  kind?: StrikeKind;
  brand?: StrikeBrand;
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
  const brand = q.brand ?? "alla";
  const plo = q.ploMm && q.ploMm > 0 ? q.ploMm : null;
  return list
    .filter((s) => s.heightMm <= q.heightMm + 2 && s.widthMm <= q.widthMm + 2)
    .filter((s) => kind === "alla" || (kind === "el") === s.electric)
    .filter((s) => brand === "alla" || strikeBrand(s) === brand)
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
