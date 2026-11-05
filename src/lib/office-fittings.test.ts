import { describe, expect, it } from "vitest";
import { OFFICE_FITTINGS, OFFICE_PAIR_FITTINGS, officeFittingMm } from "./office-fittings";
import { calculate, officeDepthMm } from "./cylinder";

describe("kollegans behörsmått", () => {
  const values = [
    ["slug17", 3], ["slug08", 4], ["assa179", 5], ["assa179-stainless", 4],
    ["assa4291", 5], ["assa-thumb", 3], ["habo-thumb", 3], ["dorma-thumb", 3.5],
    ["hoppe-thumb", 3], ["st17903", 2], ["st17904", 2],
  ] as const;
  it.each(values)("%s bygger %s mm på valfri sida", (id, mm) => {
    expect(officeFittingMm([id], "", "outside")).toBe(mm);
    expect(officeFittingMm([id], "", "inside")).toBe(mm);
  });
  it.each(["st17910", "st17911", "st17912"])("%s bygger 2 ute / 5 inne", (id) => {
    expect(officeFittingMm([], id, "outside")).toBe(2);
    expect(officeFittingMm([], id, "inside")).toBe(5);
  });
  it.each(["st17950", "st17951"])("%s bygger 2 ute / 2 inne", (id) => {
    expect(officeFittingMm([], id, "outside")).toBe(2);
    expect(officeFittingMm([], id, "inside")).toBe(2);
  });
  it("utan extra behör ändrar inte A/B-måttet", () => {
    expect(officeDepthMm(30, officeFittingMm([], "", "outside"))).toBe(30);
  });
  it("lägger till flera skyltar och par på rätt sida utan dubbelräkning", () => {
    expect(officeDepthMm(30, officeFittingMm(["slug17", "slug17", "dorma-thumb"], "st17910", "outside"))).toBe(38.5);
    expect(officeDepthMm(40, officeFittingMm(["st17903"], "st17910", "inside"))).toBe(47);
  });
  it("lämnar ett tomt mått tomt även med behör", () => {
    expect(officeDepthMm(null, 5)).toBeNull();
  });
  it("spärrar slutmått över 250mm även efter behör", () => {
    const depth = officeDepthMm(248, 5);
    expect(depth).toBe(253);
    expect(calculate({ depth: depth ?? 0, rings: [6], extenders: [10] })).toEqual([]);
  });
  it("utelämnar de tre pausade behören", () => {
    expect([...OFFICE_FITTINGS, ...OFFICE_PAIR_FITTINGS].map((f) => f.name)).not.toEqual(expect.arrayContaining(["Dorma distansring"]));
    expect(OFFICE_FITTINGS.some((f) => String(f.name) === "iLOQ distansring")).toBe(false);
    expect(OFFICE_FITTINGS.some((f) => String(f.name) === "HABO 3212")).toBe(false);
  });
});