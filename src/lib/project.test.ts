import { describe, expect, it } from "vitest";
import { canSelectFitting, doorsText, nextDoorName, projectTotals, setDoorSide, totalsText, type Door } from "./project";

describe("behörsval", () => {
  it("tillåter enkel oval och iLOQ i Pro", () => {
    expect(canSelectFitting("pro", "standard", "single")).toBe(true);
    expect(canSelectFitting("pro", "iloq", "single")).toBe(true);
  });
  it("tillåter inte rund cylinder", () => {
    expect(canSelectFitting("pro", "round", "single")).toBe(false);
  });
  it("tillåter inte dubbelcylinder", () => {
    expect(canSelectFitting("pro", "standard", "double")).toBe(false);
    expect(canSelectFitting("pro", "iloq", "double")).toBe(false);
  });
  it("tillåter inte behörsval i gratisversionen", () => {
    expect(canSelectFitting("free", "standard", "single")).toBe(false);
    expect(canSelectFitting("free", "iloq", "single")).toBe(false);
  });
});

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
    expect(totalsText({ name: "Storgatan 4", doors: roundDouble })).toContain("2st 13mm ring (rund)");
    expect(doorsText({ name: "Storgatan 4", doors: roundDouble })).toContain("Utsida: 1st 10mm förlängare + 13mm ring");
    expect(doorsText({ name: "Storgatan 4", doors: roundDouble })).not.toContain("ring utsida");
  });
  it("oval ring märks fortfarande med sida i inköpslistan", () => {
    expect(totalsText({ name: "Storgatan 4", doors })).toContain("1st 11mm ring insida (oval)");
  });
});

describe("nextDoorName", () => {
  it("föreslår nästa lediga dörrnummer", () => {
    expect(nextDoorName([])).toBe("Dörr 1");
    expect(nextDoorName(doors)).toBe("Dörr 3");
  });
});

describe("setDoorSide", () => {
  const missing: Door = { id: "9", name: "Dörr 9", kind: "oval", done: false, sides: [{ label: null, depth: 50, ring: 11, extenders: [] }] };
  const round: Door = { id: "10", name: "Dörr 10", kind: "rund", done: false, sides: [{ label: null, depth: 45, ring: 13, extenders: [10] }] };
  it("kan sätta sida på en dörr som sparades utan sida", () => {
    expect(setDoorSide(missing, 0, "Utsida").sides[0]!.label).toBe("Utsida");
  });
  it("kan växla mellan utsida och insida", () => {
    const d: Door = { ...missing, sides: [{ label: "Utsida", depth: 50, ring: 11, extenders: [] }] };
    expect(setDoorSide(d, 0, "Insida").sides[0]!.label).toBe("Insida");
  });
  it("runda cylindrar får aldrig sida – samma ring ute som inne", () => {
    expect(setDoorSide(round, 0, "Insida")).toEqual(round);
  });
});

import { doorsToPick as _dtp } from "./project";
describe("doorsToPick", () => {
  const ds = [{ id: "a", done: true }, { id: "b", done: false }] as unknown as Parameters<typeof _dtp>[0];
  it("räknar bort monterade dörrar", () => expect(_dtp(ds, true).map((d) => d.id)).toEqual(["b"]));
  it("hela projektet tar med alla", () => expect(_dtp(ds, false)).toHaveLength(2));
});

describe("hela projektet", () => {
  it("delningstexten har alla dörrar och totalt material", async () => {
    const { projectText } = await import("./project");
    const t = projectText({ name: "Kund A", doors });
    expect(t).toContain("Dörr 1 (oval)");
    expect(t).toContain("Dörr 2 (rund) – monterad");
    expect(t).toContain("2st 8mm");
  });
  it("töm dörrar behåller projektnamnet", async () => {
    const { clearDoors } = await import("./project");
    expect(clearDoors({ name: "Kund A", doors })).toEqual({ name: "Kund A", doors: [] });
  });
});
