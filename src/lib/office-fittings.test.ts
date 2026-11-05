import { describe, expect, it } from "vitest";
import { OFFICE_FITTINGS, officeFittingMm, officeFittingsFor } from "./office-fittings";
import { calculate, officeDepthMm } from "./cylinder";

describe("kollegans behörsmått", () => {
  const both = [
    ["slug17", 3], ["slug08", 4], ["assa179", 5], ["assa179-stainless", 4],
    ["assa4291", 5], ["st17903", 2], ["st17904", 2],
  ] as const;
  it.each(both)("%s bygger %s mm på valfri sida", (id, mm) => {
    expect(officeFittingMm([id], "outside")).toBe(mm);
    expect(officeFittingMm([id], "inside")).toBe(mm);
  });
  it.each(["st17910", "st17911", "st17912"])("%s bygger 2 ute / 5 inne", (id) => {
    expect(officeFittingMm([id], "outside")).toBe(2);
    expect(officeFittingMm([id], "inside")).toBe(5);
  });
  it.each(["st17950", "st17951"])("%s bygger 2 ute / 2 inne", (id) => {
    expect(officeFittingMm([id], "outside")).toBe(2);
    expect(officeFittingMm([id], "inside")).toBe(2);
  });
  it("vredskyltar finns bara på insidan", () => {
    const out = officeFittingsFor("outside").map((f) => f.id);
    const inn = officeFittingsFor("inside").map((f) => f.id);
    for (const id of ["assa-thumb", "habo-thumb", "dorma-thumb", "hoppe-thumb"]) {
      expect(out).not.toContain(id);
      expect(inn).toContain(id);
    }
    expect(officeFittingMm(["dorma-thumb"], "inside")).toBe(3.5);
    expect(officeFittingMm(["dorma-thumb"], "outside")).toBe(0);
  });
  it("utan extra behör ändrar inte A/B-måttet", () => {
    expect(officeDepthMm(30, officeFittingMm([], "outside"))).toBe(30);
  });
  it("lägger ihop flera behör på rätt sida", () => {
    expect(officeDepthMm(30, officeFittingMm(["slug17", "st17910"], "outside"))).toBe(35);
    expect(officeDepthMm(40, officeFittingMm(["st17910", "dorma-thumb"], "inside"))).toBe(48.5);
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
    const names = OFFICE_FITTINGS.map((f) => f.name);
    for (const n of ["Dorma distansring", "iLOQ distansring", "HABO 3212"]) expect(names).not.toContain(n);
  });
});

import { resolveABC, selectionMm, placementsFor } from "./office-fittings";
describe("A/B/C-mått och gemensam behörslista", () => {
  it("B + C ger A", () => expect(resolveABC(null, 25, 39)).toMatchObject({ a: 64, b: 25, c: 39 }));
  it("A och B ger C", () => expect(resolveABC(64, 25, null).c).toBe(39));
  it("A och C ger B", () => expect(resolveABC(64, null, 39).b).toBe(25));
  it("flaggar när A inte stämmer med B + C", () => expect(resolveABC(60, 25, 39).mismatch).toBe(true));
  it("Båda lägger på båda sidor", () => {
    const s = { st17910: "both" as const, "assa-thumb": "inside" as const };
    expect(selectionMm(s, "outside")).toBe(2);
    expect(selectionMm(s, "inside")).toBe(8);
  });
  it("vredskylt bara inne", () => expect(placementsFor("assa-thumb")).toEqual(["inside"]));
});
