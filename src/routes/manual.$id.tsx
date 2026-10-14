import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { LOCK_CASES, directManualPdf } from "@/lib/lock-cases";

export const Route = createFileRoute("/manual/$id")({
  loader: ({ params }) => {
    const lock = LOCK_CASES.find((l) => l.id === params.id);
    if (!lock || !directManualPdf(lock)) throw notFound();
    return { lock };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.lock.model ?? "Låshus";
    return {
      meta: [
        { title: `Manual ${name} – Låshusmanualer` },
        { name: "description", content: `Monterings- och installationsanvisning för ${name}.` },
        { property: "og:title", content: `Manual ${name}` },
        { property: "og:description", content: `Monterings- och installationsanvisning för ${name}.` },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl p-6">
      <p>Manualen hittades inte.</p>
      <Link to="/lashus" className="text-primary underline">Tillbaka till låshusen</Link>
    </div>
  ),
  component: ManualPage,
});

function ManualPage() {
  const { lock } = Route.useLoaderData();
  const pdfUrl = `/api/public/manual/${lock.id}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"laddar" | "klar" | "fel">("laddar");
  const [pages, setPages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";
    setStatus("laddar");

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const worker = await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const doc = await pdfjs.getDocument({ url: new URL(pdfUrl, window.location.href).href }).promise;
        if (cancelled) return;
        setPages(doc.numPages);
        const width = container.clientWidth;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          if (cancelled) return;
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * dpr });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.className = "rounded-lg border border-border bg-card shadow-sm";
          canvas.setAttribute("aria-label", `Sida ${i} av ${doc.numPages}`);
          container.appendChild(canvas);
          await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport }).promise;
          if (i === 1 && !cancelled) setStatus("klar");
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus("fel");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/lashus" className="flex items-center gap-1 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" /> Låshus
          </Link>
          <p className="truncate text-sm font-bold">Manual {lock.model}</p>
          <a href={pdfUrl} download className="flex items-center gap-1 text-sm font-semibold text-primary">
            <Download className="h-4 w-4" /> Ladda ner
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-3 px-4 py-4">
        {status === "laddar" && <p className="text-center text-sm text-muted-foreground">Laddar manualen…</p>}
        {status === "fel" && (
          <p className="rounded-lg border border-border bg-card p-4 text-center text-sm">
            Manualen kunde inte visas.{" "}
            <a href={pdfUrl} className="font-semibold text-primary underline">Öppna PDF:en direkt</a>
          </p>
        )}
        <div ref={containerRef} className="space-y-3" />
        {status === "klar" && pages > 0 && (
          <p className="text-center text-xs text-muted-foreground">{pages} sidor · Källa: STEP (steplock.com)</p>
        )}
      </main>
    </div>
  );
}
