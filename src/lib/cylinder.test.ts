import { describe, expect, it } from "vitest";
import { calculate, deviationOf, filterByMode, EXTENDER_SIZES, RING_HEIGHTS, ILOQ_RING_HEIGHTS, ILOQ_CYLINDER_MM } from "./cylinder";

const all = { extenders: [...EXTENDER_SIZES], rings: [...RING_HEIGHTS] };

describe("deviationOf", () => {
  it("följer formeln", () => {
    expect(deviationOf(30, 10, 11)).toBe(0);
    expect(deviationOf(30, 12.5, 11)).toBe(2.5);
  });
});

describe("toleranser", () => {
  it("alla resultat ligger inom −1 till +2 mm", () => {
    for (let d = 0; d <= 60; d += 0.5) {
      for (const c of calculate({ depth: d, ...all })) {
        expect(c.deviation).toBeGreaterThanOrEqual(-1);
        expect(c.deviation).toBeLessThanOrEqual(2);
        expect(c.deviation).toBe(deviationOf(d, c.totalExtension, c.ring));
      }
    }
  });
  it("gränsvärden −1 och +2 accepteras, −1,5 och +2,5 inte", () => {
    const r = calculate({ depth: 26, extenders: [], rings: [6] }); // 31-26-6 = -1
    expect(r.map((c) => c.deviation)).toEqual([-1]);
    expect(calculate({ depth: 23, extenders: [], rings: [6] })[0]!.deviation).toBe(2);
    expect(calculate({ depth: 26.5, extenders: [], rings: [6] })).toEqual([]);
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
  it("använder 40 mm som cylinderlängd", () => {
    // djup 29, ring 11, inga förlängare: 40-29-11 = 0
    const r = calculate({ depth: 29, extenders: [], rings: [11], baseMm: ILOQ_CYLINDER_MM });
    expect(r[0]!.deviation).toBe(0);
    expect(deviationOf(29, 0, 11, ILOQ_CYLINDER_MM)).toBe(0);
  });
  it("stödjer ringhöjderna 27, 30 och 33 mm", () => {
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
        expect(c.deviation).toBeGreaterThanOrEqual(-1);
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
  it("använder 30 mm, ringar 8/13 och 10 mm förlängare", () => {
    // 30 + 10 - 27 - 13 = 0
    expect(calculate({ depth: 27, extenders: [10], rings: [8, 13], baseMm: 30 })[0]!.deviation).toBe(0);
    for (const c of calculate({ depth: 33.5, extenders: [10], rings: [8, 13], baseMm: 30 })) {
      expect([8, 13]).toContain(c.ring);
      expect(c.extenders.every((e) => e === 10)).toBe(true);
    }
  });
  it("ger alltid bästa resultat även utanför toleransen (relaxed)", () => {
    // djup 12: 30-12-13 = +5, utan relaxed inget resultat
    expect(calculate({ depth: 12, extenders: [10], rings: [8, 13], baseMm: 30 })).toEqual([]);
    const r = calculate({ depth: 12, extenders: [10], rings: [8, 13], baseMm: 30, relaxed: true });
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]!.deviation).toBe(5); // bästa möjliga: ring 13, inga förlängare
    // mycket djupt: många förlängare men alltid ett svar
    const deep = calculate({ depth: 60, extenders: [10], rings: [8, 13], baseMm: 30, relaxed: true });
    expect(deep.length).toBeGreaterThan(0);
    expect(deep[0]!.deviation).toBeLessThanOrEqual(2); // 30+40-60-13 = -3... bästa blir 30+40-60-8=+2
  });
});
