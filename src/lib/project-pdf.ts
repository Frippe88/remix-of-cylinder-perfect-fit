// Builds an A4 PDF of a project (doors + material list) in the browser.
import { doorsToPick, doorTitle, purchaseList, sideText, type Project } from "./project";

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
  doc.setTextColor(230, 120, 30); text("Cylinderhjälpen", 10, true); doc.setTextColor(0);
  y += 5; text(p.name || "Projekt", 20, true); y += 1;
  text(`${new Date().toLocaleDateString("sv-SE")} · ${doors.length} ${doors.length === 1 ? "dörr" : "dörrar"}${remainingOnly ? " kvar att montera" : ""}`, 10);

  heading("Inköpslista");
  const sections = purchaseList(doors);
  sections.forEach((s, si) => {
    need(14);
    if (si) y += 3;
    text(s.title, 12, true);
    s.groups.forEach((g) => {
      need(10 + g.items.length * 6.4);
      doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(200, 90, 10);
      doc.text(g.title.toUpperCase(), M, y); y += 4.5; doc.setTextColor(0);
      g.items.forEach((it, i) => {
        if (i % 2 === 0) { doc.setFillColor(245, 245, 245); doc.rect(M, y - 4.2, W - 2 * M, 6.4, "F"); }
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.text(`${it.count} st`, M + 2, y);
        doc.setFont("helvetica", "normal"); doc.text(it.text, M + 20, y);
        y += 6.4;
      });
      y += 2;
    });
  });
  if (!sections.length) text("Inget material.", 10);

  heading("Dörrlista");
  doors.forEach((d) => {
    need(8 + d.sides.length * 6 + (d.fitting ? 6 : 0));
    doc.setDrawColor(60); doc.setLineWidth(0.3); doc.rect(M, y - 3.6, 4, 4);
    if (d.done) { doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.text("X", M + 0.9, y - 0.4); }
    text(`${doorTitle(d)}${d.done ? " – monterad" : ""}`, 11, true, M + 7);
    d.sides.forEach((s) => text(sideText(s, d.kind, d.fitting, d.sides.length > 1), 10, false, M + 7));
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
