import { createFileRoute } from "@tanstack/react-router";
import { Info, Ruler } from "lucide-react";
import { useMemo, useState } from "react";
import { AppTabs } from "@/components/app-tabs";
import { matchByDimensions } from "@/lib/strike-dims";
import {
  WOOD_COLUMNS,
  existingOptions,
  findByExisting,
  type WoodColumnId,
} from "@/lib/strike";

export const Route = createFileRoute("/stolpvaljare")({
  head: () => ({
    meta: [
      { title: "Stolpväljare – rätt montagestolpe för karmens urtag" },
      { name: "description", content: "Mät urtaget i karmen och se vilka montagestolpar och slutbleck som passar." },
      { property: "og:title", content: "Stolpväljare" },
      { property: "og:description", content: "Ange urtagets mått och hitta passande stolpe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Stolpvaljare,
});

const label = (id: WoodColumnId) => WOOD_COLUMNS.find((c) => c.id === id)!.label;
const selectCls = "mt-1 w-full rounded-lg border border-input bg-card px-3 py-3 text-base font-semibold outline-none focus:ring-2 focus:ring-ring";
const inputCls = "mt-1 w-full rounded-lg border border-input bg-card px-3 py-3 text-base font-semibold outline-none focus:ring-2 focus:ring-ring";

function Stolpvaljare() {
  const [mode, setMode] = useState<"matt" | "befintlig">("matt");
  const [h, setH] = useState("");
  const [w, setW] = useState("");
  const [d, setD] = useState("");
  const [existing, setExisting] = useState("");
  const [target, setTarget] = useState<WoodColumnId>("step40");

  const options = useMemo(() => existingOptions(), []);
  const groups = WOOD_COLUMNS.map((c) => ({ ...c, items: options.filter((o) => o.column === c.id) })).filter((g) => g.items.length);
  const guideResults = existing ? findByExisting(existing, target) : null;

  const hn = Number(h), wn = Number(w), dn = Number(d);
  const filled = h !== "" && w !== "" && d !== "";
  const matches = filled ? matchByDimensions(hn, wn, dn) : null;

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Låssmedsverktyg</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">Stolpväljare</h1>
          <p className="mt-2 max-w-xl text-sm opacity-80">Mät urtaget i karmen och se vilka stolpar som passar.</p>
          <AppTabs />
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <section className="space-y-5 rounded-xl border bg-card p-4 shadow-card">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {([["matt", "Mått på urtag"], ["befintlig", "Befintlig produkt"]] as const).map(([id, l]) => (
              <button key={id} onClick={() => setMode(id)} aria-pressed={mode === id}
                className={`rounded-md px-2 py-2 text-sm font-semibold ${mode === id ? "bg-card shadow-card" : "text-muted-foreground"}`}>{l}</button>
            ))}
          </div>

          {mode === "matt" ? (
            <>
              <p className="flex gap-2 text-xs text-muted-foreground">
                <Ruler className="h-4 w-4 shrink-0" />
                Mät urtaget i karmen där stolpen ska sitta – höjd, bredd och djup i millimeter.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <label className="block">
                  <span className="text-sm font-semibold">Höjd</span>
                  <input className={inputCls} inputMode="numeric" pattern="[0-9]*" placeholder="mm" value={h} onChange={(e) => setH(e.target.value.replace(/[^0-9]/g, ""))} />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Bredd</span>
                  <input className={inputCls} inputMode="numeric" pattern="[0-9]*" placeholder="mm" value={w} onChange={(e) => setW(e.target.value.replace(/[^0-9]/g, ""))} />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Djup</span>
                  <input className={inputCls} inputMode="numeric" pattern="[0-9]*" placeholder="mm" value={d} onChange={(e) => setD(e.target.value.replace(/[^0-9]/g, ""))} />
                </label>
              </div>
            </>
          ) : (
            <>
              <label className="block">
                <span className="text-sm font-semibold">1. Vad sitter i karmen i dag?</span>
                <span className="block text-xs text-muted-foreground">Slutblecket eller elslutblecket vars urtag du vill återanvända.</span>
                <select className={selectCls} value={existing} onChange={(e) => setExisting(e.target.value)}>
                  <option value="">Välj befintlig produkt…</option>
                  {groups.map((g) => (
                    <optgroup key={g.id} label={g.label}>
                      {g.items.map((o) => (
                        <option key={o.value} value={o.value}>{o.article}{o.angled ? " (vinkel i framkant)" : ""}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">2. Vilket elslutbleck ska monteras?</span>
                <select className={selectCls} value={target} onChange={(e) => setTarget(e.target.value as WoodColumnId)}>
                  {WOOD_COLUMNS.filter((c) => c.target).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </label>
            </>
          )}
        </section>

        <section className="space-y-3">
          {mode === "matt" ? (
            matches == null ? (
              <Empty>Fyll i höjd, bredd och djup på urtaget för att se vilka stolpar som passar.</Empty>
            ) : matches.length === 0 ? (
              <Empty>Ingen stolpe i listan ryms i ett urtag på <b>{hn}×{wn}×{dn} mm</b>. Kontrollera måtten – eller kontakta STEP för kundanpassad stolpe.</Empty>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  <b className="text-foreground">{matches.length} stolpar</b> ryms i urtaget {hn}×{wn}×{dn} mm – tätast passform först.
                </p>
                {matches.map((m) => (
                  <div key={m.article} className="rounded-xl border bg-card p-4 shadow-card">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-mono text-2xl font-extrabold">{m.article}</p>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{m.shape === "plan" ? "Plan stolpe" : "Vinklad stolpe"}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">För {m.fits}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-center">
                      <div><p className="text-xs text-muted-foreground">Höjd</p><p className="font-mono font-bold">{m.heightMm} mm</p></div>
                      <div><p className="text-xs text-muted-foreground">Bredd</p><p className="font-mono font-bold">{m.widthMm} mm</p></div>
                      <div><p className="text-xs text-muted-foreground">Plösmått</p><p className="font-mono font-bold">{m.depthMm} mm</p></div>
                    </div>
                    {m.note && <p className="mt-2 text-xs text-muted-foreground">{m.note}</p>}
                  </div>
                ))}
              </>
            )
          ) : guideResults == null ? (
            <Empty>Välj vad som sitter i karmen i dag för att se vilken stolpe som passar.</Empty>
          ) : guideResults.length === 0 ? (
            <Empty>Guiden har ingen stolpe för <b>{label(target)}</b> i det här urtaget. Prova ett annat elslutbleck eller kontakta STEP för kundanpassad stolpe.</Empty>
          ) : (
            guideResults.map((r) => (
              <div key={r.target} className="rounded-xl border border-primary bg-card p-4 shadow-card">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Montagestolpe för {label(target)}</p>
                <p className="mt-1 font-mono text-3xl font-extrabold">{r.target}</p>
                {r.angled && <p className="mt-1 text-sm">Motsvarar mekaniskt slutbleck med vinkel i framkant.</p>}
                {r.equivalents.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs font-semibold text-muted-foreground">Passar samma urtag</p>
                    <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
                      {r.equivalents.map((e) => (
                        <li key={e.column + e.article}><span className="font-mono font-bold">{e.article}</span> <span className="text-muted-foreground">· {label(e.column)}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}

          <div className="flex gap-2 rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0" />
            <p>Måtten är ett urval av STEP:s vanligaste stolpar – kontrollera alltid mot stolpens måttskiss innan montage. Fler modeller finns på steplock.se.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">{children}</p>;
}
