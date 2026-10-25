import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FEATURES = [
  "Spara obegränsat antal egna projekt med alla dörrar",
  "Behörsval – 256 (vred), 2356 (täckbricka) och skruvlängder",
  "Total plocklista för hela bygget",
  "PDF-arbetsorder att skicka till grossist eller kollega",
];

export function ProDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl"><Star className="size-5 text-accent" aria-hidden />Cylinderkalkyl Pro</DialogTitle>
          <DialogDescription>Pro är i beta och helt gratis att använda just nu. Det här ingår:</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm font-medium">
          {FEATURES.map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />{f}</li>)}
        </ul>
        <p className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm">Senare blir Pro en prenumeration.</p>
        <Button className="min-h-11 bg-accent font-bold text-accent-foreground hover:bg-accent/85" onClick={() => onOpenChange(false)}>Börja använda Pro gratis</Button>
      </DialogContent>
    </Dialog>
  );
}
