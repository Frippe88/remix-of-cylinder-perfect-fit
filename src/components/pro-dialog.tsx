import { Check, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FEATURES = [
  "Mät och spara dörr för dörr – samla hela bygget i ett projekt",
  "Behörsval (256, 2356, 18256) – visar direkt om det är färdig sats eller lös ring",
  "Automatisk inköpslista för chefen – per cylindertyp med satser, ringpar och förlängare",
  "PDF med ett klick – komplett arbetsorder eller bara inköpslista",
  "Kopiera till mejl/SMS – klistra in beställningen direkt",
  "Flera projekt samtidigt – växla mellan olika byggen och kunder",
];

const COMING = [
  "Automatisk skruvlängd – räknas ut efter hur många förlängare dörren har",
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
