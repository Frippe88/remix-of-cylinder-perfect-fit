import { describe, expect, it } from "vitest";
import { doorsText, nextDoorName, projectTotals, totalsText, type Door } from "./project";

const doors: Door[] = [
  { id: "1", name: "Dörr 1", kind: "oval", done: false, sides: [
    { label: "Utsida", depth: 50, ring: 11, extenders: [8, 8] },
    { label: "Insida", depth: 40, ring: 11, extenders: [] },
  ] },
  { id: "2", name: "Dörr 2", kind: "rund", done: true, sides: [{ label: null, depth: 45, ring: 13, extenders: [10] }] },
];

const roundDouble: Door[] = [
  { id: "3", name: "Dörr 3", kind: "rund", done: false, sides: [
    { label: "Utsida", depth: 45, ring: 13, extenders: [10] },
    { label: "Insida", depth: 50, ring: 13, extenders: [] },
  ] },
];

describe("projectTotals", () => {
  it("räknar ihop förlängare per storlek över alla dörrar", () => {
    const t = projectTotals(doors);
    expect(t.extenders).toContainEqual({ size: 8, kind: "oval", count: 2 });
    expect(t.extenders).toContainEqual({ size: 10, kind: "rund", count: 1 });
  });
  it("skiljer på utsida- och insidaring", () => {
    expect(projectTotals(doors).rings).toContainEqual({ size: 11, kind: "oval", side: "Insida", count: 1 });
  });
  it("räknar en ring per sida och skiljer på oval och rund", () => {
    const t = projectTotals(doors);
    expect(t.rings).toContainEqual({ size: 11, kind: "oval", side: "Utsida", count: 1 });
    expect(t.rings).toContainEqual({ size: 13, kind: "rund", side: "", count: 1 });
  });
  it("rund cylinder har samma ring ute och inne – ringen delas inte per sida", () => {
    const t = projectTotals(roundDouble);
    expect(t.rings).toEqual([{ size: 13, kind: "rund", side: "", count: 2 }]);
    expect(totalsText({ name: "Storgatan 4", doors: roundDouble })).toContain("2 st 13 mm ring (rund)");
    expect(doorsText({ name: "Storgatan 4", doors: roundDouble })).toContain("Utsida: 1 st 10 mm förlängare + 13 mm ring");
    expect(doorsText({ name: "Storgatan 4", doors: roundDouble })).not.toContain("ring utsida");
  });
  it("oval ring märks fortfarande med sida i inköpslistan", () => {
    expect(totalsText({ name: "Storgatan 4", doors })).toContain("1 st 11 mm ring insida (oval)");
  });
});

describe("nextDoorName", () => {
  it("föreslår nästa lediga dörrnummer", () => {
    expect(nextDoorName([])).toBe("Dörr 1");
    expect(nextDoorName(doors)).toBe("Dörr 3");
  });
});
