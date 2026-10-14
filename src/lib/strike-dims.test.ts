import { describe, expect, it } from "vitest";
import { matchByDimensions } from "./strike-dims";

describe("matchByDimensions", () => {
  it("hittar 200×40-stolpar i ett 200×40×16-urtag", () => {
    const r = matchByDimensions(200, 40, 16);
    expect(r.map((m) => m.article)).toContain("ST4009-16");
    expect(r.map((m) => m.article)).toContain("1487-2");
    // 245 höga stolpar ryms inte
    expect(r.map((m) => m.article)).not.toContain("ST4002-15");
  });

  it("kräver att djupet räcker till plösmåttet", () => {
    const r = matchByDimensions(200, 40, 13);
    expect(r.map((m) => m.article)).toContain("ST4009-13");
    expect(r.map((m) => m.article)).not.toContain("ST4009-16");
  });

  it("hittar vinklade 245×40-stolpar", () => {
    const r = matchByDimensions(245, 40, 15);
    expect(r.map((m) => m.article)).toContain("ST4002-15");
  });

  it("sorterar tätast passform först", () => {
    const r = matchByDimensions(245, 40, 21);
    expect(r[0]!.slackMm).toBeLessThanOrEqual(r[r.length - 1]!.slackMm);
  });

  it("ger tomt resultat på ogiltiga mått", () => {
    expect(matchByDimensions(0, 40, 15)).toEqual([]);
    expect(matchByDimensions(200, -1, 15)).toEqual([]);
  });
});
