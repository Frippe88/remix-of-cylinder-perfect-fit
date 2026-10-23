import { describe, expect, it } from "vitest";
import { nextDoorName, projectTotals, type Door } from "./project";

const doors: Door[] = [
  { id: "1", name: "Dörr 1", kind: "oval", done: false, sides: [
    { label: "Utsida", depth: 50, ring: 11, extenders: [8, 8] },
    { label: "Insida", depth: 40, ring: 11, extenders: [] },
  ] },
  { id: "2", name: "Dörr 2", kind: "rund", done: true, sides: [{ label: null, depth: 45, ring: 13, extenders: [10] }] },
];

describe("projectTotals", () => {
  it("räknar ihop förlängare per storlek över alla dörrar", () => {
    const t = projectTotals(doors);
    expect(t.extenders).toContainEqual({ size: 8, kind: "oval", count: 2 });
    expect(t.extenders).toContainEqual({ size: 10, kind: "rund", count: 1 });
  });
  it("räknar en ring per sida och skiljer på oval och rund", () => {
    const t = projectTotals(doors);
    expect(t.rings).toContainEqual({ size: 11, kind: "oval", count: 2 });
    expect(t.rings).toContainEqual({ size: 13, kind: "rund", count: 1 });
  });
});

describe("nextDoorName", () => {
  it("föreslår nästa lediga dörrnummer", () => {
    expect(nextDoorName([])).toBe("Dörr 1");
    expect(nextDoorName(doors)).toBe("Dörr 3");
  });
});
