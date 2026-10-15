import { describe, expect, it } from "vitest";
import { matchStrikePlates } from "./strike-plates";

describe("matchStrikePlates", () => {
  it("returnerar inget för ogiltiga mått", () => {
    expect(matchStrikePlates({ heightMm: 0, widthMm: 40 })).toEqual([]);
  });
  it("200×40 urtag ger bara 200 mm-stolpar", () => {
    const r = matchStrikePlates({ heightMm: 200, widthMm: 40 });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((s) => s.heightMm === 200)).toBe(true);
  });
  it("önskat plösmått sorteras först", () => {
    const r = matchStrikePlates({ heightMm: 250, widthMm: 40, ploMm: 26 });
    expect(r[0]?.article).toBe("ST4001-26");
  });
  it("filtrerar mekaniska", () => {
    const r = matchStrikePlates({ heightMm: 200, widthMm: 40, kind: "mekanisk" });
    expect(r.every((s) => !s.electric)).toBe(true);
    expect(r).toHaveLength(4);
  });
  it("för smalt urtag ger inga träffar", () => {
    expect(matchStrikePlates({ heightMm: 300, widthMm: 30 })).toEqual([]);
  });
  it("ASSA-filter ger ASSA-stolpar för elslutbleck", () => {
    const r = matchStrikePlates({ heightMm: 245, widthMm: 40, kind: "el", brand: "ASSA" });
    expect(r.map((s) => s.article)).toContain("930");
    expect(r.every((s) => !s.article.startsWith("ST"))).toBe(true);
  });
});
