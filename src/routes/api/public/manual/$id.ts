import { createFileRoute } from "@tanstack/react-router";
import { LOCK_CASES, directManualPdf } from "@/lib/lock-cases";

// Publik proxy för verifierade tillverkarmanualer. Endast fasta, allowlistade URL:er per låshus-id.
export const Route = createFileRoute("/api/public/manual/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const lock = LOCK_CASES.find((l) => l.id === params.id);
        const url = lock && directManualPdf(lock);
        if (!lock || !url) return new Response("Manual saknas", { status: 404 });
        const upstream = await fetch(url);
        if (!upstream.ok || !upstream.body) return Response.redirect(url, 302);
        const name = `${lock.model.replace(/[^\w-]+/g, "-")}-manual.pdf`;
        return new Response(upstream.body, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${name}"`,
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
