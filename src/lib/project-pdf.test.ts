import { beforeEach, describe, expect, it, vi } from "vitest";
import { projectPdf } from "./project-pdf";
import type { Project } from "./project";

const { printed } = vi.hoisted(() => ({ printed: [] as string[] }));
vi.mock("jspdf", () => ({ jsPDF: class {
  setFont() {} setFontSize() {} setDrawColor() {} setLineWidth() {} line() {} setTextColor() {} rect() {} addPage() {} setPage() {}
  splitTextToSize(text: string) { return [text]; }
  text(text: string | string[]) { printed.push(...(Array.isArray(text) ? text : [text])); }
  getNumberOfPages() { return 1; }
  output() { return new Blob([printed.join("\n")], { type: "application/pdf" }); }
} }));

beforeEach(() => { printed.length = 0; });
const project: Project = { name: "Test", doors: [
  { id: "1", name: "Entré", kind: "oval", done: false, fitting: "256", sides: [{ label: "Utsida", depth: 36, ring: 11, extenders: [8, 8] }] },
  { id: "2", name: "Förråd", kind: "iloq", done: true, fitting: "2356", sides: [{ label: "Utsida", depth: 36, ring: 11, extenders: [] }] },
] };

describe("behör i PDF", () => {
  it("exporterar 256 och 2356 i inköpslistan och på respektive dörr", async () => {
    await projectPdf(project, false);
    expect(printed).toContain("1st  256 behör med 11mm ring utsida (oval)");
    expect(printed).toContain("1st  2356 behör med 11mm ring utsida (iLOQ)");
    expect(printed.some((line) => line.includes("256 behör med 11mm ring") && line.includes("dörrdjup"))).toBe(true);
    expect(printed.some((line) => line.includes("2356 behör med 11mm ring") && line.includes("dörrdjup"))).toBe(true);
    expect(printed.some((line) => line.includes("vred") || line.includes("täckbricka"))).toBe(false);
    expect(printed).not.toContain("Ringar");
  });
  it("räknar bort monterade dörrars behör i kvarvarande material", async () => {
    await projectPdf(project, true);
    expect(printed).toContain("1st  256 behör med 11mm ring utsida (oval)");
    expect(printed.some((line) => line.includes("2356"))).toBe(false);
  });
  it("lägger inte till behör om inget valts", async () => {
    await projectPdf({ name: "Test", doors: [{ id: "3", name: "Utan behör", kind: "oval", done: false, sides: [] }] }, false);
    expect(printed.some((line) => line.includes("256") || line.includes("2356"))).toBe(false);
  });
});