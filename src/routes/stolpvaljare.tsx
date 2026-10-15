import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppTabs } from "@/components/app-tabs";
import { matchStrikePlates, strikeBrand, STRIKE_PLATES, type StrikeKind, type StrikeBrand, type StrikeMatch } from "@/lib/strike-plates";
import { strikeImage, strikeImageNote } from "@/lib/strike-images";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/stolpvaljare")({
  head: () => ({
    meta: [
      { title: "Stolpväljare – hitta rätt monteringsstolpe" },
      { name: "description", content: "Ange urtagets höjd, bredd och plösmått och se vilka STEP- och ASSA-stolpar som passar." },
      { property: "og:title", content: "Stolpväljare – hitta rätt monteringsstolpe" },
      { property: "og:description", content: "Matcha karmurtag mot monteringsstolpar från STEP och ASSA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StrikePage,
});

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"
  }`;

function NumField({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="relative mt-1">
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={hint}
          className="w-full rounded-lg border border-input bg-card py-3 pl-3 pr-12 text-lg font-semibold"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">mm</span>
      </div>
    </label>
  );
}

const num = (s: string) => Number(s.replace(",", "."));

function StrikePage() {
  const [h, setH] = useState("");
  const [w, setW] = useState("");
  const [p, setP] = useState("");
  const [kind, setKind] = useState<StrikeKind>("alla");
  const [brand, setBrand] = useState<StrikeBrand>("alla");
  const [open, setOpen] = useState<string | null>(null);
  const openPlate = STRIKE_PLATES.find((x) => x.article === open);
  const ready = num(h) > 0 && num(w) > 0;
  const results = useMemo(
    () => matchStrikePlates({ heightMm: num(h), widthMm: num(w), ploMm: p ? num(p) : undefined, kind, brand }),
    [h, w, p, kind, brand],
  );
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
  const nq = norm(q);
  const hit = (s: { article: string; fits: string }) =>
    !nq || norm(s.article).includes(nq) || norm(s.article).replace(/^st/, "").startsWith(nq) || norm(s.fits).includes(nq);
  const suggestions = useMemo(() => {
    if (!nq) return [];
    const rank = (a: string) => (norm(a).startsWith(nq) || norm(a).replace(/^st/, "").startsWith(nq) ? 0 : 1);
    return STRIKE_PLATES.filter(hit)
      .sort((a, b) => rank(a.article) - rank(b.article) || a.article.localeCompare(b.article, "sv", { numeric: true }))
      .slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nq]);
  // Utan mått visas hela katalogen (med fabrikats-/typfilter), sorterad efter mått.
  const shown: StrikeMatch[] = useMemo(
    () =>
      (ready
        ? results
        : STRIKE_PLATES.filter((s) => kind === "alla" || (kind === "el") === s.electric)
            .filter((s) => brand === "alla" || strikeBrand(s) === brand)
            .map((s) => ({ ...s, heightSlackMm: 0, widthSlackMm: 0, ploDiffMm: null }))
            .sort((a, b) => a.heightMm - b.heightMm || a.widthMm - b.widthMm || a.ploMm - b.ploMm || a.article.localeCompare(b.article, "sv"))
      ).filter(hit),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, results, kind, brand, nq],
  );

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Låssmedsverktyg</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Stolpväljare</h1>
          <p className="mt-2 max-w-xl text-sm opacity-80">Ange måtten på urtaget i karmen och vilket plösmått du vill ha.</p>
          <AppTabs />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <section className="relative rounded-xl border border-border bg-card p-4">
          <label className="block">
            <span className="text-sm font-semibold">Sök stolpe</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              placeholder="t.ex. 930, 931-20 eller ST6504"
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-3 text-lg font-semibold"
            />
          </label>
          {focus && suggestions.length > 0 && (
            <ul className="absolute left-4 right-4 z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
              {suggestions.map((s) => (
                <li key={s.article}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setQ(s.article); setFocus(false); setOpen(s.article); }}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-muted"
                  >
                    <span className="font-bold">{s.article}</span>
                    <span className="truncate text-xs text-muted-foreground">{s.heightMm}×{s.widthMm} • plös {s.ploMm} mm</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
          <NumField label="Urtagets höjd" hint="t.ex. 245" value={h} onChange={setH} />
          <NumField label="Urtagets bredd" hint="t.ex. 40" value={w} onChange={setW} />
          <NumField label="Önskat plösmått" hint="valfritt" value={p} onChange={setP} />
        </section>

        <div className="flex flex-wrap gap-2">
          {([
            ["alla", "Alla stolpar"],
            ["el", "För elslutbleck"],
            ["mekanisk", "Mekaniska"],
          ] as const).map(([k, l]) => (
            <button key={k} className={chip(kind === k)} onClick={() => setKind(k)}>{l}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ["alla", "Alla fabrikat"],
            ["STEP", "STEP"],
            ["ASSA", "ASSA ABLOY"],
          ] as const).map(([k, l]) => (
            <button key={k} className={chip(brand === k)} onClick={() => setBrand(k)}>{l}</button>
          ))}
        </div>

        {!ready && (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Fyll i urtagets mått för att filtrera listan – just nu visas alla stolpar i katalogen.
          </p>
        )}
        {ready && results.length === 0 ? (
          <p className="rounded-xl border border-warning bg-warning-soft p-4 text-sm">
            Ingen stolpe i katalogen ryms i det urtaget. Kontrollera måtten eller välj en annan typ.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {ready ? `${results.length} passande stolpar – bäst först` : `Alla stolpar i katalogen (${shown.length} st)`}
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {shown.map((s, i) => {
                const exactPlo = s.ploDiffMm === 0;
                const img = strikeImage(s.article);
                return (
                  <li key={s.article} className={`rounded-xl border bg-card p-4 ${ready && i === 0 ? "border-primary ring-1 ring-primary" : "border-border"}`}>
                    <button
                      type="button"
                      onClick={() => setOpen(s.article)}
                      className="flex w-full items-start gap-3 text-left"
                      aria-label={`Visa bild på ${s.article}`}
                    >
                      {img && (
                        <img src={img} alt={s.article} loading="lazy" className="h-20 w-20 shrink-0 rounded-md border border-border bg-card object-contain" />
                      )}
                      <div className="min-w-0 flex-1">
                        {ready && i === 0 && <p className="text-xs font-bold uppercase tracking-wide text-primary">Bäst passform</p>}
                        <p className="text-lg font-extrabold">{s.article}</p>
                        <p className="text-sm text-muted-foreground">{s.fits}</p>
                        <p className="mt-1 text-xs font-semibold text-primary">Tryck för stor bild</p>
                      </div>
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold capitalize">{s.shape}</span>
                    </button>
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="rounded-md bg-muted p-2"><dt className="text-xs text-muted-foreground">Höjd</dt><dd className="font-bold">{s.heightMm} mm</dd></div>
                      <div className="rounded-md bg-muted p-2"><dt className="text-xs text-muted-foreground">Bredd</dt><dd className="font-bold">{s.widthMm} mm</dd></div>
                      <div className={`rounded-md p-2 ${s.ploDiffMm === null ? "bg-muted" : exactPlo ? "bg-success-soft" : "bg-warning-soft"}`}>
                        <dt className="text-xs text-muted-foreground">Plös</dt>
                        <dd className="font-bold">
                          {s.ploMm} mm
                          {s.ploDiffMm !== null && !exactPlo && (
                            <span className="block text-xs font-medium">{s.ploDiffMm > 0 ? "+" : ""}{s.ploDiffMm} mm</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                    {s.note && <p className="mt-2 text-xs text-muted-foreground">{s.note}</p>}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          Uppgifterna bygger på STEP:s stolpguide och ASSA 1487-serien. Kontrollera alltid mot tillverkarens måttskiss innan beställning.
        </p>

        <Dialog open={!!openPlate} onOpenChange={(o) => !o && setOpen(null)}>
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-lg">
            {openPlate && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extrabold">{openPlate.article}</DialogTitle>
                  <DialogDescription>{openPlate.fits} • <span className="capitalize">{openPlate.shape}</span> stolpe</DialogDescription>
                </DialogHeader>
                {strikeImage(openPlate.article) && (
                  <img src={strikeImage(openPlate.article)} alt={`Produktbild ${openPlate.article}`} className="max-h-[60vh] w-full rounded-lg border border-border bg-card object-contain" />
                )}
                {strikeImageNote(openPlate.article) && <p className="text-xs text-muted-foreground">{strikeImageNote(openPlate.article)}</p>}
                <dl className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-md bg-muted p-2"><dt className="text-xs text-muted-foreground">Höjd</dt><dd className="font-bold">{openPlate.heightMm} mm</dd></div>
                  <div className="rounded-md bg-muted p-2"><dt className="text-xs text-muted-foreground">Bredd</dt><dd className="font-bold">{openPlate.widthMm} mm</dd></div>
                  <div className="rounded-md bg-muted p-2"><dt className="text-xs text-muted-foreground">Plös</dt><dd className="font-bold">{openPlate.ploMm} mm</dd></div>
                </dl>
                {openPlate.note && <p className="text-sm text-muted-foreground">{openPlate.note}</p>}
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
