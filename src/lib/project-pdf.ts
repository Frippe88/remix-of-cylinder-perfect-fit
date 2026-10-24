// Builds an A4 PDF of a project (doors + material list) in the browser.
import { formatMm } from "./cylinder";
import { doorsToPick, KIND_LABEL, projectTotals, sideText, type Project } from "./project";

export async function projectPdf(p: Project, remainingOnly: boolean): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 16, BOTTOM = 280;
  let y = M;
  const need = (h: number) => { if (y + h > BOTTOM) { doc.addPage(); y = M; } };
  const text = (s: string, size = 10, bold = false, x = M) => {
    doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(size);
    const lines = doc.splitTextToSize(s, W - x - M) as string[];
    need(lines.length * size * 0.45);
    doc.text(lines, x, y); y += lines.length * size * 0.45 + 1.5;
  };
  const heading = (s: string) => {
    need(14); y += 4; text(s, 13, true);
    doc.setDrawColor(230, 120, 30); doc.setLineWidth(0.6); doc.line(M, y - 1, W - M, y - 1); y += 3;
  };

  const doors = doorsToPick(p.doors, remainingOnly);
  const t = projectTotals(doors);
  doc.setTextColor(230, 120, 30); text("Cylinderhjälpen", 10, true); doc.setTextColor(0);
  text(p.name || "Projekt", 20, true);
  text(`${new Date().toLocaleDateString("sv-SE")} · ${doors.length} ${doors.length === 1 ? "dörr" : "dörrar"}${remainingOnly ? " kvar att montera" : ""}`, 10);

  heading("Inköpslista");
  if (t.extenders.length) { text("Förlängare", 11, true); t.extenders.forEach((e) => text(`${e.count}st  ${formatMm(e.size)} förlängare (${KIND_LABEL[e.kind]})`, 10, false, M + 4)); }
  if (t.rings.length) { y += 1; text("Ringar", 11, true); t.rings.forEach((r) => text(`${r.count}st  ${formatMm(r.size)} ring${r.side ? ` ${r.side.toLowerCase()}` : ""} (${KIND_LABEL[r.kind]})`, 10, false, M + 4)); }
  if (!t.extenders.length && !t.rings.length) text("Inget material.", 10);

  heading("Dörrlista");
  doors.forEach((d) => {
    need(8 + d.sides.length * 6);
    doc.setDrawColor(60); doc.setLineWidth(0.3); doc.rect(M, y - 3.6, 4, 4);
    if (d.done) { doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.text("X", M + 0.9, y - 0.4); }
    text(`${d.name} (${KIND_LABEL[d.kind]})${d.done ? " – monterad" : ""}`, 11, true, M + 7);
    d.sides.forEach((s) => text(`${sideText(s, d.kind)} · dörrdjup ${formatMm(s.depth)}`, 10, false, M + 7));
    y += 1.5;
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(120); doc.text(`cylinderhjalpen.se · sida ${i} av ${pages}`, M, 290); }
  return doc.output("blob");
}

export function pdfFileName(p: Project): string {
  const n = (p.name || "Projekt").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w-]+/g, "_");
  return `Cylinderhjalpen_${n}.pdf`;
}

export async function deliverFile(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return; }
    catch (e) { if ((e as DOMException).name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
