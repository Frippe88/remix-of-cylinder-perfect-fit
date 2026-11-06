import { describe, it, expect } from "vitest";
import { calculate, preferOvalDoublePair, ovalDoubleScrewNeedMm, EXTENDER_SIZES, RING_HEIGHTS } from "./cylinder";

const list = (d: number) => calculate({ depth: d, extenders: [...EXTENDER_SIZES], rings: [...RING_HEIGHTS] });

describe("dubbel oval skruv", () => {
  it("21/39 ger 63mm-lösning", () => {
    const [o, i] = preferOvalDoublePair(list(21), list(39))!;
    expect(ovalDoubleScrewNeedMm(o.totalExtension + i.totalExtension)).toBeLessThanOrEqual(63);
  });
  it("21/40 väljer kortaste skruv inom toleransen (65,5mm)", () => {
    const [o, i] = preferOvalDoublePair(list(21), list(40))!;
    expect(ovalDoubleScrewNeedMm(o.totalExtension + i.totalExtension)).toBe(65.5);
  });
});
