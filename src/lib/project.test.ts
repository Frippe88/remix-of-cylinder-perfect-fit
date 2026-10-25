import { describe, expect, it } from "vitest";
import { canSelectFitting, fittingOptions, doorsText, FITTING_LABEL, nextDoorName, projectText, projectTotals, setDoorSide, sideText, totalsText, type Door, type Fitting, type Project } from "./project";

describe("behör i material och delning", () => {
  const door = (id: string, fitting?: "256" | "2356", done = false): Door => ({ id, name: `Dörr ${id}`, kind: "oval", done, sides: [{ label: "Utsida", depth: 36, ring: 11, extenders: [8, 8] }], ...(fitting ? { fitting } : {}) });
  const project = { name: "Test", doors: [door("1", "256"), door("2", "256", true), door("3", "2356"), door("4")] };
  it("summerar en vald behörssats per dörr och lämnar ovalda dörrar utan behör", () => {
    expect(projectTotals(project.doors).fittings).toEqual([{ fitting: "256", size: 11, kind: "oval", side: "Utsida", inner: false, count: 2 }, { fitting: "2356", size: 11, kind: "oval", side: "Utsida", inner: false, count: 1 }]);
    expect(projectTotals([door("4")]).fittings).toEqual([]);
    expect(projectTotals(project.doors).rings).toEqual([{ size: 11, kind: "oval", side: "Utsida", inner: false, count: 1 }]);
  });
  it("skiljer på ringhöjd och cylindertyp för samma behör", () => {
    const first = door("1", "256");
    const taller: Door = { ...door("2", "256"), sides: [{ label: "Utsida", depth: 36, ring: 13, extenders: [] }] };
    const iloq: Door = { ...door("3", "256"), kind: "iloq" };
    expect(projectTotals([first, taller, iloq]).fittings).toHaveLength(3);
    expect(projectTotals([first, taller, iloq]).rings).toEqual([]);
  });
  it("kopierade inköpslistor inkluderar valda behör och räknar bort monterade dörrar", () => {
    expect(totalsText(project)).toContain("2st 256 behör med 11mm ring");
    expect(totalsText(project)).toContain("1st 2356 behör med 11mm ring");
    expect(totalsText(project, true)).toContain("1st 256 behör med 11mm ring");
  });
  it("kopierade dörrlistor och hela projektet behåller valt behör per dörr", () => {
    expect(doorsText(project)).toContain("256 behör med 11mm ring");
    expect(doorsText(project)).toContain("2356 behör med 11mm ring");
    expect(projectText(project)).toContain("2st 256 behör med 11mm ring");
    expect(projectText(project)).toContain("2356 behör med 11mm ring");
    expect(doorsText({ name: "Test", doors: [door("4")] })).not.toContain("behör");
  });
  it("sparade listor visar bara behörets namn – inget fabrikat eller vred/täckbricka", () => {
    const withFitting = (fitting: Fitting): Door => ({ id: "7", name: "Dörr 7", kind: fitting === "DAK 752" ? "rund" : "oval", done: false, sides: [{ label: "Utsida", depth: 36, ring: 11, extenders: [] }], fitting });
    const all: Project = { name: "Kund B", doors: (Object.keys(FITTING_LABEL) as Fitting[]).filter((f) => f !== "vred" && f !== "tackbricka").map(withFitting) };
    for (const text of [totalsText(all), doorsText(all), projectText(all)]) {
      for (const forbidden of ["ASSA", "dormakaba", "DORMA", "vred", "täckbricka", "Täckbricka"]) expect(text).not.toContain(forbidden);
    }
    expect(totalsText(all)).toContain("1st DAK 7200 behör med 11mm ring");
    expect(totalsText(all)).toContain("1st DAK 752 behör med 11mm ring");
    expect(doorsText(all)).toContain("Utsida: 256 behör med 11mm ring");
  });
});

describe("behörsval", () => {
  it("tillåter enkel oval och iLOQ i Pro", () => {
    expect(canSelectFitting("pro", "standard", "single")).toBe(true);
    expect(canSelectFitting("pro", "iloq", "single")).toBe(true);
  });
  it("tillåter 3212 för rund ASSA-cylinder men inte andra fabrikat", () => {
    expect(fittingOptions("pro", "round", "double", "ASSA ABLOY")).toEqual(["3212"]);
    expect(fittingOptions("pro", "round", "single", "ASSA ABLOY")).toEqual(["3212"]);
    expect(canSelectFitting("pro", "round", "double", "EVVA")).toBe(false);
    expect(canSelectFitting("free", "round", "double", "ASSA ABLOY")).toBe(false);
  });
  it("ger 18256 för dubbel oval och A10.11 för dubbel iLOQ", () => {
    expect(fittingOptions("pro", "standard", "double")).toEqual(["18256"]);
    expect(canSelectFitting("pro", "iloq", "double")).toBe(true);
  });
  it("ger DAK 752 för rund dormakaba och Vred/Täckbricka-Cylinder för enkelcylinder", () => {
    expect(fittingOptions("pro", "round", "double", "dormakaba / DORMA")).toEqual(["DAK 752"]);
    expect(fittingOptions("pro", "standard", "single")).toEqual(["vred", "tackbricka"]);
    expect(fittingOptions("pro", "iloq", "single")).toEqual(["vred", "tackbricka"]);
  });
  it("räknar ihop samma ring med vred och summerar alla förlängare", () => {
    const d = (i: number, fitting: Fitting, ring: number, ext: number[]): Door => ({ id: `${i}`, name: `Dörr ${i}`, kind: "oval", done: false, sides: [{ label: "Utsida", depth: 50, ring, extenders: ext }], fitting });
    const p: Project = { name: "P", doors: [1, 2, 3, 4, 5].map((i) => d(i, "vred", 21, [10])).concat(d(6, "tackbricka", 13, [8, 10])) };
    const t = totalsText(p);
    expect(t).toContain("5st Vred med cylinder 21mm ring");
    expect(t).toContain("1st Täckbricka med cylinder 13mm ring");
    expect(t).toContain("7st förlängare totalt");
    expect(doorsText(p)).toContain("Utsida: Vred med cylinder 21mm ring + 1st 10mm förlängare");
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
    expect(projectTotals(doors).rings).toContainEqual({ size: 11, kind: "oval", side: "Insida", inner: false, count: 1 });
  });
  it("räknar en ring per sida och skiljer på oval och rund", () => {
    const t = projectTotals(doors);
    expect(t.rings).toContainEqual({ size: 11, kind: "oval", side: "Utsida", inner: false, count: 1 });
    expect(t.rings).toContainEqual({ size: 13, kind: "rund", side: "", inner: false, count: 1 });
  });
  it("rund cylinder har samma ring ute och inne – ringen delas inte per sida", () => {
    const t = projectTotals(roundDouble);
    expect(t.rings).toEqual([{ size: 13, kind: "rund", side: "", inner: false, count: 2 }]);
    expect(totalsText({ name: "Storgatan 4", doors: roundDouble })).toContain("2st 13mm rund ring");
    expect(doorsText({ name: "Storgatan 4", doors: roundDouble })).toContain("Utsida: 13mm ring + 1st 10mm förlängare");
    expect(doorsText({ name: "Storgatan 4", doors: roundDouble })).not.toContain("ring utsida");
  });
  it("inköpslistan slår ihop samma ring oavsett sida", () => {
    expect(totalsText({ name: "Storgatan 4", doors })).toContain("2st 11mm ring");
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

describe("iLOQ dubbelcylinder – A10.11 och innerring", () => {
  const dbl: Door = { id: "i", name: "Dörr 1", kind: "iloq", done: false, sides: [
    { label: "Utsida", depth: 20, ring: 11, extenders: [] },
    { label: "Insida", depth: 20, ring: 27, extenders: [] },
  ] };
  it("A10.11 är enda behörsvalet för dubbel iLOQ i Pro", () => {
    expect(fittingOptions("pro", "iloq", "double")).toEqual(["A10.11"]);
    expect(fittingOptions("free", "iloq", "double")).toEqual([]);
  });
  it("insidan blir iLOQ innerring även utan behör", () => {
    expect(sideText(dbl.sides[1]!, "iloq", undefined, true)).toBe("Insida: 27mm iLOQ innerring");
    expect(sideText(dbl.sides[0]!, "iloq", undefined, true)).toBe("Utsida: 11mm ring");
  });
  it("A10.11 hamnar bara på insidan", () => {
    const d = { ...dbl, fitting: "A10.11" as const };
    expect(sideText(d.sides[1]!, "iloq", "A10.11", true)).toBe("Insida: A10.11 monteringskit med 27mm iLOQ innerring");
    expect(sideText(d.sides[0]!, "iloq", "A10.11", true)).toBe("Utsida: 11mm ring");
    const t = projectTotals([d, { ...d, id: "j" }]);
    expect(t.fittings).toEqual([]);
    expect(t.kits).toEqual([{ fitting: "A10.11", count: 2 }]);
    expect(t.rings.map((r) => [r.size, r.side, r.inner, r.count])).toEqual([[11, "Utsida", false, 2], [27, "Insida", true, 2]]);
    const txt = totalsText({ name: "P", doors: [d] });
    expect(txt).toContain("FÄRDIGA BEHÖR:\n1st A10.11 monteringskit");
    expect(txt).toContain("LÖSA DELAR:\n1st 11mm ring\n1st 27mm iLOQ innerring");
    expect(txt).not.toContain("insida");
  });
  it("enkel iLOQ på insidan får ingen innerring", () => {
    expect(sideText({ label: "Insida", depth: 20, ring: 27, extenders: [] }, "iloq", undefined, false)).toBe("Insida: 27mm ring");
  });
});

describe("256/2356 plocka själv", () => {
  const d = (ring: number, fitting: Fitting = "256"): Door => ({ id: String(ring), name: "Dörr 1", kind: "iloq", done: false, sides: [{ label: "Utsida", depth: 13, ring, extenders: [] }], fitting });
  it("ring upp till 21 mm är färdig sats", () => {
    const t = projectTotals([d(6), d(21)]);
    expect(t.loose).toEqual([]);
    expect(t.fittings).toHaveLength(2);
  });
  it("ring över 21 mm: plocka själv med ringen på samma rad, per ringhöjd", () => {
    const t = projectTotals([d(27), d(27), d(30), d(30, "2356")]);
    expect(t.fittings).toEqual([]);
    expect(t.rings).toEqual([]);
    expect(t.loose.map((f) => [f.fitting, f.size, f.count])).toEqual([["256", 27, 2], ["256", 30, 1], ["2356", 30, 1]]);
    const p: Project = { name: "P", doors: [d(27), d(27), d(30)] };
    expect(totalsText(p)).toContain("BEHÖR, PLOCKA SJÄLV:\n3st 256 behör (utan ring)\n\nLÖSA DELAR:\n2st 27mm ring\n1st 30mm ring");
    expect(doorsText(p)).toContain("256 behör, plocka själv med 27mm ring");
  });
});

