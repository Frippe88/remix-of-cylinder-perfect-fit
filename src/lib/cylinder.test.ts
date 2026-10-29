import { describe, expect, it } from "vitest";
import { calculate, deviationOf, filterByMode, EXTENDER_SIZES, RING_HEIGHTS, ILOQ_RING_HEIGHTS, ILOQ_CYLINDER_MM, ROUND_CYLINDER_MM, ASSA_ROUND_CYLINDER_MM, ASSA_ROUND_BRAND, ASSA_S_BRAND, roundScrewSet } from "./cylinder";

const all = { extenders: [...EXTENDER_SIZES], rings: [...RING_HEIGHTS] };

describe("deviationOf", () => {
  it("följer formeln", () => {
    expect(deviationOf(30, 10, 11)).toBe(0);
    expect(deviationOf(30, 12.5, 11)).toBe(2.5);
  });
});

describe("toleranser", () => {
  it("alla resultat ligger inom −2 till +2mm", () => {
    for (let d = 0; d <= 60; d += 0.5) {
      for (const c of calculate({ depth: d, ...all })) {
        expect(c.deviation).toBeGreaterThanOrEqual(-2);
        expect(c.deviation).toBeLessThanOrEqual(2);
        expect(c.deviation).toBe(deviationOf(d, c.totalExtension, c.ring));
      }
    }
  });
  it("gränsvärden −2 och +2 accepteras, −2,5 och +2,5 inte", () => {
    const r = calculate({ depth: 27, extenders: [], rings: [6] }); // 31-27-6 = -2
    expect(r.map((c) => c.deviation)).toEqual([-2]);
    expect(calculate({ depth: 23, extenders: [], rings: [6] })[0]!.deviation).toBe(2);
    expect(calculate({ depth: 27.5, extenders: [], rings: [6] })).toEqual([]);
    expect(calculate({ depth: 22.5, extenders: [], rings: [6] })).toEqual([]);
  });
  it("exakt 0 sorteras först", () => {
    const r = calculate({ depth: 20, ...all });
    expect(r[0]!.deviation).toBe(0);
  });
  it("är deterministisk", () => {
    expect(calculate({ depth: 33, ...all })).toEqual(calculate({ depth: 33, ...all }));
  });
});

describe("saknade storlekar", () => {
  it("avmarkerade storlekar förekommer aldrig", () => {
    const r = calculate({ depth: 40, extenders: [8, 12.5], rings: [6, 13, 21] });
    expect(r.length).toBeGreaterThan(0);
    for (const c of r) {
      expect(c.extenders).not.toContain(10);
      expect([6, 13, 21]).toContain(c.ring);
    }
  });
  it("inga ringar ger inget resultat", () => {
    expect(calculate({ depth: 20, extenders: [...EXTENDER_SIZES], rings: [] })).toEqual([]);
  });
  it("tillåter många förlängare av samma storlek", () => {
    const r = calculate({ depth: 80, extenders: [8], rings: [6] }); // 31+8n-80-6 = 0 => n=6.875
    expect(r.every((c) => c.extenders.every((e) => e === 8))).toBe(true);
    expect(r.some((c) => c.extenderCount >= 7)).toBe(true);
  });
});

describe("dubbelcylinder", () => {
  it("utsida och insida beräknas oberoende", () => {
    const out = calculate({ depth: 20, ...all });
    const ins = calculate({ depth: 35, ...all });
    expect(out).not.toEqual(ins);
    expect(out.every((c) => c.deviation === deviationOf(20, c.totalExtension, c.ring))).toBe(true);
    expect(ins.every((c) => c.deviation === deviationOf(35, c.totalExtension, c.ring))).toBe(true);
  });
});

describe("iLOQ-cylinder", () => {
  const iloq = { extenders: [...EXTENDER_SIZES], rings: [...RING_HEIGHTS, ...ILOQ_RING_HEIGHTS], baseMm: ILOQ_CYLINDER_MM };
  it("använder 40mm som cylinderlängd", () => {
    // djup 29, ring 11, inga förlängare: 40-29-11 = 0
    const r = calculate({ depth: 29, extenders: [], rings: [11], baseMm: ILOQ_CYLINDER_MM });
    expect(r[0]!.deviation).toBe(0);
    expect(deviationOf(29, 0, 11, ILOQ_CYLINDER_MM)).toBe(0);
  });
  it("stödjer ringhöjderna 27, 30 och 33mm", () => {
    // djup 40: ring 27 + 12,5+8 = 40+20,5-40-27 = -6,5... kontrollera istället exakta träffar per ring
    for (const ring of ILOQ_RING_HEIGHTS) {
      // 40 + 0 - djup - ring = 0 => djup = 40 - ring
      const r = calculate({ depth: ILOQ_CYLINDER_MM - ring, extenders: [], rings: [ring], baseMm: ILOQ_CYLINDER_MM });
      expect(r[0]!.deviation).toBe(0);
    }
  });
  it("alla iLOQ-resultat ligger inom tolerans", () => {
    for (let d = 0; d <= 80; d += 0.5) {
      for (const c of calculate({ depth: d, ...iloq })) {
        expect(c.deviation).toBeGreaterThanOrEqual(-2);
        expect(c.deviation).toBeLessThanOrEqual(2);
        expect(c.deviation).toBe(deviationOf(d, c.totalExtension, c.ring, ILOQ_CYLINDER_MM));
      }
    }
  });
  it("samma djup ger olika resultat för standard och iLOQ", () => {
    const std = calculate({ depth: 35, ...all });
    const iq = calculate({ depth: 35, ...iloq });
    expect(std).not.toEqual(iq);
  });
});

describe("alternativa kombinationer", () => {
  it("visar flera kombinationer med samma passform", () => {
    // djup 36: 8+10 med ring 13 = 0, och 10+12,5... kontrollera flera exakta
    const exact = filterByMode(calculate({ depth: 36, ...all }), "exact");
    expect(exact.length).toBeGreaterThan(1);
    const keys = new Set(exact.map((c) => c.ring + ":" + c.extenders.join(",")));
    expect(keys.size).toBe(exact.length);
  });
  it("färre förlängare använder färre delar än exakt bästa", () => {
    const list = calculate({ depth: 36, ...all });
    const fewer = filterByMode(list, "fewer");
    const minExact = Math.min(...filterByMode(list, "exact").map((c) => c.extenderCount));
    expect(fewer.length).toBeGreaterThan(0);
    expect(fewer[0]!.extenderCount).toBeLessThanOrEqual(minExact);
  });
});

describe("rund cylinder", () => {
  it("använder 33mm, ringar 8/13 och 10mm förlängare", () => {
    // 33 + 10 - 30 - 13 = 0
    expect(calculate({ depth: 30, extenders: [10], rings: [8, 13], baseMm: ASSA_ROUND_CYLINDER_MM })[0]!.deviation).toBe(0);
    for (const c of calculate({ depth: 33.5, extenders: [10], rings: [8, 13], baseMm: ASSA_ROUND_CYLINDER_MM })) {
      expect([8, 13]).toContain(c.ring);
      expect(c.extenders.every((e) => e === 10)).toBe(true);
    }
  });
  it("ger alltid bästa resultat även utanför toleransen (relaxed)", () => {
    // djup 12: 33-12-13 = +8, utan relaxed inget resultat
    expect(calculate({ depth: 12, extenders: [10], rings: [8, 13], baseMm: ASSA_ROUND_CYLINDER_MM })).toEqual([]);
    const r = calculate({ depth: 12, extenders: [10], rings: [8, 13], baseMm: ASSA_ROUND_CYLINDER_MM, relaxed: true });
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]!.deviation).toBe(8); // bästa möjliga: ring 13, inga förlängare
    // mycket djupt: alltid ett svar
    const deep = calculate({ depth: 70, extenders: [10], rings: [8, 13], baseMm: ASSA_ROUND_CYLINDER_MM, relaxed: true });
    expect(deep.length).toBeGreaterThan(0);
    expect(deep[0]!.deviation).toBe(0); // 33+50-70-13 = 0
  });
});

import { cylinderBaseMm } from "./cylinder";
describe("iLOQ dubbelcylinder", () => {
  it("lägger till 6mm endast på insidan vid dubbelcylinder", () => {
    expect(cylinderBaseMm("iloq", "inside", true)).toBe(46);
    expect(cylinderBaseMm("iloq", "outside", true)).toBe(40);
    expect(cylinderBaseMm("iloq", "inside", false)).toBe(40);
    expect(cylinderBaseMm("standard", "inside", true)).toBe(31);
  });
  it("endast ASSA ABLOY rund räknas med 33mm, övriga fabrikat 31mm", () => {
    expect(cylinderBaseMm("round", "outside", false, ASSA_ROUND_BRAND)).toBe(33);
    expect(cylinderBaseMm("round", "outside", false, "EVVA")).toBe(31);
    expect(cylinderBaseMm("round", "inside", true, "dormakaba / DORMA")).toBe(ROUND_CYLINDER_MM);
  });
});

describe("dubbel iLOQ insida utan förlängare", () => {
  it("ger bara innerring utan förlängare när förlängare är tomt", () => {
    const r = calculate({ depth: 16, extenders: [], rings: [...ILOQ_RING_HEIGHTS], baseMm: 46 });
    expect(r[0]).toMatchObject({ ring: 30, extenderCount: 0, deviation: 0 });
  });
});

import { roundRingHeights as _rrh, ASSA_S_BRAND as _S, ASSA_ROUND_BRAND as _R, cylinderBaseMm as _cb } from "./cylinder";
describe("ASSA S-serie", () => {
  it("bara 15mm ring och 33mm bas", () => {
    expect(_rrh(_S)).toEqual([15]);
    expect(_rrh(_R)).toEqual([8, 13]);
    expect(_cb("round", "outside", false, _S)).toBe(33);
    expect(_cb("round", "outside", false, _R)).toBe(33);
  });
});

describe("rund 8mm ring", () => {
  it("får aldrig sticka in (bara 0 eller plus)", () => {
    const r = calculate({ depth: 26, extenders: [10], rings: [8, 13], baseMm: 33, relaxed: true, noUndercutRings: [8] });
    expect(r[0]).toMatchObject({ ring: 13, extenders: [10], deviation: 4 });
    expect(r.some((c) => c.ring === 8 && c.deviation < 0)).toBe(false);
    expect(calculate({ depth: 25, extenders: [10], rings: [8], baseMm: 33, relaxed: true, noUndercutRings: [8] })[0]!.deviation).toBe(0);
  });
});

describe("skruvsats rund cylinder", () => {
  it("ASSA utan S och dormakaba: 60/70/80/90mm", () => {
    expect(roundScrewSet(ASSA_ROUND_BRAND, 0)?.text).toBe("4 st 60mm skruv");
    expect(roundScrewSet("dormakaba / DORMA", 3)?.text).toBe("4 st 90mm skruv");
  });
  it("ASSA med S: 66/76/86/96mm", () => {
    expect(roundScrewSet(ASSA_S_BRAND, 0)?.text).toContain("66mm");
    expect(roundScrewSet(ASSA_S_BRAND, 3)?.text).toContain("96mm");
  });
  it("EVVA: delade längder 35+60 upp till 65+90", () => {
    expect(roundScrewSet("EVVA", 0)?.text).toBe("2 st 35mm + 2 st 60mm skruv");
    expect(roundScrewSet("EVVA", 3)?.text).toBe("2 st 65mm + 2 st 90mm skruv");
  });
  it("över 3 förlängare ger varning", () => {
    expect(roundScrewSet("EVVA", 4)?.warning).toBe(true);
  });
});

import { ovalSingleScrewSet } from "./cylinder";
describe("skruv enkel oval", () => {
  it("0 förlängare ger 24mm", () => expect(ovalSingleScrewSet(0).text).toBe("2 st 24mm cylinderskruv"));
  it("4 st 8mm (32mm) räcker med 63mm", () => expect(ovalSingleScrewSet(32).warning).toBe(false));
  it("3 st 10mm räcker med 63mm", () => expect(ovalSingleScrewSet(30).warning).toBe(false));
  it("4 st 10mm (40mm) kräver längre skruv", () => expect(ovalSingleScrewSet(40).warning).toBe(true));
  it("3 st 12,5mm (37,5mm) kräver längre skruv", () => expect(ovalSingleScrewSet(37.5).warning).toBe(true));
});

import { preferOvalScrewFit } from "./cylinder";
describe("enkel oval prioriterar 63mm-skruv", () => {
  for (const depth of [55, 56, 57]) {
    it(`djup ${depth} ger kombination där 63mm räcker`, () => {
      const best = preferOvalScrewFit(calculate({ depth, ...all }))[0]!;
      expect(ovalSingleScrewSet(best.totalExtension).warning).toBe(false);
      expect(Math.abs(best.deviation)).toBeLessThanOrEqual(2);
    });
  }
});

describe("färre förlängare tänker på 63mm-skruven", () => {
  const list = calculate({ depth: 56, ...all });
  it("väljer kombination där 63mm räcker vid samma antal förlängare", () => {
    const best = filterByMode(list, "fewer", true)[0]!;
    expect(ovalSingleScrewSet(best.totalExtension).warning).toBe(false);
    expect(best.extenderCount).toBe(Math.min(...filterByMode(list, "fewer").map((c) => c.extenderCount)));
  });
  it("utan skruvhjälp väljs exakt 0mm som kräver längre skruv", () => {
    const best = filterByMode(list, "fewer")[0]!;
    expect(best.deviation).toBe(0);
    expect(ovalSingleScrewSet(best.totalExtension).warning).toBe(true);
  });
});

import { ovalDoubleScrewSet } from "./cylinder";
describe("skruv dubbel oval", () => {
  it("0 förlängning ger 48mm", () => expect(ovalDoubleScrewSet(0).text).toBe("2 st 48mm cylinderskruv"));
  it("15mm totalt räcker med 63mm", () => expect(ovalDoubleScrewSet(15).warning).toBe(false));
  it("16mm totalt kräver längre skruv, minst 64mm", () => {
    const s = ovalDoubleScrewSet(16);
    expect(s.warning).toBe(true);
    expect(s.text).toContain("minst 64mm");
  });
});

import { preferOvalDoublePair } from "./cylinder";
describe("dubbel oval väljer par där 63mm räcker", () => {
  it("total förlängning max 15mm inom ±2mm när det finns", () => {
    const o = calculate({ depth: 28, ...all }), i = calculate({ depth: 28, ...all });
    const [a, b] = preferOvalDoublePair(o, i)!;
    expect(ovalDoubleScrewSet(a.totalExtension + b.totalExtension).warning).toBe(false);
    expect(Math.abs(a.deviation)).toBeLessThanOrEqual(2);
    expect(Math.abs(b.deviation)).toBeLessThanOrEqual(2);
  });
});
