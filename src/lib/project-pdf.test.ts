import { beforeEach, describe, expect, it, vi } from "vitest";
import { FITTING_NOTE, projectPdf } from "./project-pdf";
import type { Project } from "./project";

const { printed } = vi.hoisted(() => ({ printed: [] as string[] }));
vi.mock("jspdf", () => ({ jsPDF: class {
  setFont() {} setFontSize() {} setDrawColor() {} setLineWidth() {} line() {} setTextColor() {} rect() {} addPage() {} setPage() {} setFillColor() {}
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
    expect(printed).toContain("256 behör (11mm ring)");
    expect(printed).toContain("2356 behör (11mm ring)");
    expect(printed).toContain("Oval cylinder");
    expect(printed).toContain("ENKELCYLINDER");
    expect(printed.some((line) => line.startsWith("Utsida: 256 behör (11mm ring)"))).toBe(true);
    expect(printed.some((line) => line.startsWith("Utsida: 2356 behör (11mm ring)"))).toBe(true);
    expect(printed.some((line) => line.includes("dörrdjup"))).toBe(false);
    expect(printed.some((line) => line.includes("vred") || line.includes("täckbricka"))).toBe(false);
    expect(printed).not.toContain("Ringar");
  });
  it("räknar bort monterade dörrars behör i kvarvarande material", async () => {
    await projectPdf(project, true);
    expect(printed).toContain("256 behör (11mm ring)");
    expect(printed.some((line) => line !== FITTING_NOTE && line.includes("2356"))).toBe(false);
  });
  it("lägger inte till behör om inget valts", async () => {
    await projectPdf({ name: "Test", doors: [{ id: "3", name: "Utan behör", kind: "oval", done: false, sides: [] }] }, false);
    expect(printed.some((line) => line !== FITTING_NOTE && (line.includes("256") || line.includes("2356")))).toBe(false);
  });
  it("PDF utan dörrlista har inköpslistan men ingen dörrlista", async () => {
    await projectPdf(project, false, false);
    expect(printed).toContain("256 behör (11mm ring)");
    expect(printed).not.toContain("Dörrlista");
    expect(printed).toContain(FITTING_NOTE);
  });
});