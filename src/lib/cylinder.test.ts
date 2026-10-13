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
