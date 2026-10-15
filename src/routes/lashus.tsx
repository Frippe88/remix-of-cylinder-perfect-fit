import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ExternalLink, Maximize2, Search, X } from "lucide-react";
import { AppTabs } from "@/components/app-tabs";
import {
  CATEGORY_LABEL,
  LOCK_CASES,
  filterLocks,
  manualSearchUrl,
  hasDirectManual,
  type LockBrand,
  type LockCategory,
} from "@/lib/lock-cases";
import { LOCK_IMAGES } from "@/lib/lock-images";

export const Route = createFileRoute("/lashus")({
  head: () => ({
    meta: [
      { title: "Låshusmanualer – ASSA och STEP" },
      { name: "description", content: "Sök bland ASSA- och STEP-låshus och hitta tillverkarens monteringsanvisning snabbt." },
      { property: "og:title", content: "Låshusmanualer – ASSA och STEP" },
      { property: "og:description", content: "Hitta manualer för mekaniska låshus, mikro, eltryckeslås och motorlås." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LockCasesPage,
});

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"
  }`;

function LockCasesPage() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<LockBrand | "alla">("alla");
  const [category, setCategory] = useState<LockCategory | "alla">("alla");
  const [zoomId, setZoomId] = useState<string | null>(null);
  const list = useMemo(() => filterLocks(LOCK_CASES, query, brand, category), [query, brand, category]);

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Låssmedsverktyg</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Låshusmanualer</h1>
          <p className="mt-2 max-w-xl text-sm opacity-80">ASSA och STEP – klicka på ett låshus för att hitta manualen.</p>
          <AppTabs />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök, t.ex. 310, 810S eller STEP 120"
            className="w-full rounded-lg border border-input bg-card py-3 pl-9 pr-3 text-base"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {(["alla", "ASSA", "STEP", "SAFETRON"] as const).map((b) => (
            <button key={b} className={chip(brand === b)} onClick={() => setBrand(b)}>
              {b === "alla" ? "Alla fabrikat" : b}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={chip(category === "alla")} onClick={() => setCategory("alla")}>Alla typer</button>
          {(Object.keys(CATEGORY_LABEL) as LockCategory[]).map((c) => (
            <button key={c} className={chip(category === c)} onClick={() => setCategory(c)}>
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{list.length} låshus</p>

        {list.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-6 text-center">Inget låshus matchar sökningen.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {list.map((l) => {
              const zoomable = Boolean(LOCK_IMAGES[l.id]);
              return (
                <li key={l.id}>
                  <div
                    className={`flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors ${
                      zoomable ? "cursor-zoom-in hover:border-primary" : ""
                    }`}
                    onClick={zoomable ? () => setZoomId(l.id) : undefined}
                    onKeyDown={
                      zoomable
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setZoomId(l.id);
                            }
                          }
                        : undefined
                    }
                    role={zoomable ? "button" : undefined}
                    tabIndex={zoomable ? 0 : undefined}
                    aria-label={zoomable ? `Förstora bilden på ${l.brand === "ASSA" ? `ASSA ${l.model}` : l.model}` : undefined}
                  >
                    <LockThumb id={l.id} />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        {l.brand} · {CATEGORY_LABEL[l.category]}
                      </p>
                      <p className="mt-1 text-lg font-bold">{l.brand === "ASSA" ? `ASSA ${l.model}` : l.model}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{l.note}</p>
                      <div className="mt-3">
                        {hasDirectManual(l) ? (
                          <Link
                            to="/manual/$id"
                            params={{ id: l.id }}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                          >
                            Öppna manual (PDF)
                          </Link>
                        ) : (
                          <a
                            href={manualSearchUrl(l)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-card px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-muted"
                          >
                            Hitta manual hos tillverkaren
                          </a>
                        )}
                      </div>
                    </div>
                    {zoomable && <Maximize2 className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-xs text-muted-foreground">
          Manualerna öppnas från ASSA ABLOY:s, STEP:s och Safetrons egna webbplatser. Kontrollera alltid modell och utförande mot låshusets märkning.
        </p>
      </main>

      {zoomId && <ImageZoom lock={LOCK_CASES.find((l) => l.id === zoomId)!} onClose={() => setZoomId(null)} />}
    </div>
  );
}

function LockThumb({ id }: { id: string }) {
  const src = LOCK_IMAGES[id];
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
      {src ? (
        <img src={src} alt="" loading="lazy" className="h-full w-full object-contain p-1" />
      ) : (
        <span className="px-1 text-center text-[10px] leading-tight text-muted-foreground">Bild saknas</span>
      )}
    </div>
  );
}
