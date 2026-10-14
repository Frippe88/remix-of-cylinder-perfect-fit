import { describe, expect, it } from "vitest";
import { existingOptions, findByExisting, findByProfile, splitCell } from "./strike";

describe("stolpväljare", () => {
  it("ASSA 1487-2 → STEP 40-stolpe ST4009-16", () => {
    expect(findByExisting("mek|1487-2", "step40").map((r) => r.target)).toEqual(["ST4009-16"]);
  });
  it("vinklat slutbleck 1887-2* → STEP 92 ST9509", () => {
    const r = findByExisting("mek|1887-2*", "step92");
    expect(r.map((x) => x.target)).toEqual(["ST9509"]);
    expect(r[0]?.angled).toBe(true);
  });
  it("Solid 730 → STEP 60 ST6504H/V och tomt när modellen saknas", () => {
    expect(findByExisting("solidStd|730", "step60").map((r) => r.target)).toEqual(["ST6504H/V"]);
    expect(findByExisting("solidEnkla|505", "step92")).toEqual([]);
  });
  it("profiler och listor", () => {
    expect(findByProfile("Sapa 2074").find((x) => x.column.startsWith("STEP 92"))?.article).toBe("ST9511");
    expect(existingOptions().length).toBeGreaterThan(40);
    expect(splitCell("730T/732T")).toEqual(["730T", "732T"]);
  });
});
