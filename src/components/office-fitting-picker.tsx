import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OFFICE_FITTINGS, placementsFor, type FittingPlacement, type FittingSelection } from "@/lib/office-fittings";
import { formatMm } from "@/lib/cylinder";

const LABEL: Record<FittingPlacement, string> = { outside: "Ute", inside: "Inne", both: "Båda" };
const label = (p: FittingPlacement, n: number) => (n === 1 ? "Välj" : LABEL[p]);

export function OfficeFittingPicker({ selected, onChange }: { selected: FittingSelection; onChange: (s: FittingSelection) => void }) {
  const count = Object.keys(selected).length;
  const set = (id: string, p: FittingPlacement) => {
    const next = { ...selected };
    if (next[id] === p) delete next[id]; else next[id] = p;
    onChange(next);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-auto min-h-11 w-full justify-between gap-2 px-3 py-2 text-left">
          <span className="flex min-w-0 items-center gap-2"><Plus className="size-4 shrink-0 text-accent" /><span className="text-xs">Extra behör</span></span>
          <span className="min-w-0 truncate text-right text-xs font-semibold">{count ? OFFICE_FITTINGS.filter((f) => selected[f.id]).map((f) => f.name).join(", ") : "Utan"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>Extra behör</DialogTitle></DialogHeader>
        <p className="text-xs text-muted-foreground">Välj sida per behör – även insidan vid enkelcylinder.</p>
        <Button variant={count ? "outline" : "secondary"} onClick={() => onChange({})}>Utan extra behör</Button>
        <div className="divide-y divide-border">
          {OFFICE_FITTINGS.map((f) => (
            <div key={f.id} className="flex min-h-11 items-center gap-2 py-2 text-sm">
              <span className="flex-1">
                {f.name}
                <span className="block font-mono text-xs text-muted-foreground">
                  {f.outside === null ? `inne +${formatMm(f.inside)}` : f.outside === f.inside ? `+${formatMm(f.inside)}` : `ute +${formatMm(f.outside)} / inne +${formatMm(f.inside)}`}
                </span>
              </span>
              <div className="flex gap-1">
                {placementsFor(f.id).map((p, _i, all) => (
                  <button key={p} type="button" aria-pressed={selected[f.id] === p} onClick={() => set(f.id, p)}
                    className={`min-h-9 min-w-11 rounded-md border px-2 text-xs font-semibold ${selected[f.id] === p ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground"}`}>
                    {label(p, all.length)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DialogClose asChild><Button className="w-full"><Package className="size-4" />Klar</Button></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
