import { describe, expect, it } from "vitest";
import { findStrikes } from "./strike";

describe("findStrikes", () => {
  it("matchar urtag inom tolerans och filtrerar fabrikat/typ", () => {
    const r = findStrikes({ brands: ["STEP"], kind: "el", profile: "alla", length: 214, width: null });
    expect(r.map((m) => m.strike.id)).toEqual(["step-plan-215", "step-vinkel-215"]);
  });
  it("ger inget när måttet ligger utanför", () => {
    expect(findStrikes({ brands: ["ASSA"], kind: "mekanisk", profile: "alla", length: 180, width: null })).toEqual([]);
  });
  it("filtrerar på bredd och profil", () => {
    const r = findStrikes({ brands: ["ASSA", "STEP"], kind: "el", profile: "vinkel", length: 200, width: 26 });
    expect(r.map((m) => m.strike.id)).toEqual(["assa-el-vinkel-200"]);
  });
});
