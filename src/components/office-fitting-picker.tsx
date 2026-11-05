import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { officeFittingMm, officeFittingsFor } from "@/lib/office-fittings";
import { formatMm } from "@/lib/cylinder";

export function OfficeFittingPicker({ side, selected, onChange }: {
  side: "outside" | "inside"; selected: string[]; onChange: (ids: string[]) => void;
}) {
  const label = side === "outside" ? "utsida" : "insida";
  const extra = officeFittingMm(selected, side);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-auto min-h-11 w-full justify-between gap-2 px-3 py-2 text-left">
          <span className="flex min-w-0 items-center gap-2"><Plus className="size-4 shrink-0 text-accent" /><span className="text-xs">Extra behör {label}</span></span>
          <span className="shrink-0 font-mono text-xs">{extra ? `+${formatMm(extra)}` : "Utan"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>Extra behör – {label}</DialogTitle></DialogHeader>
        <Button variant={selected.length ? "outline" : "secondary"} onClick={() => onChange([])}>Utan extra behör på {label}</Button>
        <div className="divide-y divide-border">
          {officeFittingsFor(side).map((f) => (
            <label key={f.id} className="flex min-h-11 cursor-pointer items-center gap-3 py-2 text-sm">
              <input type="checkbox" className="size-4 accent-accent" checked={selected.includes(f.id)} onChange={() => onChange(selected.includes(f.id) ? selected.filter((id) => id !== f.id) : [...selected, f.id])} />
              <span className="flex-1">{f.name}</span><span className="font-mono font-semibold">+{formatMm(f.mm)}</span>
            </label>
          ))}
        </div>
        <DialogClose asChild><Button className="w-full"><Package className="size-4" />Klar</Button></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
