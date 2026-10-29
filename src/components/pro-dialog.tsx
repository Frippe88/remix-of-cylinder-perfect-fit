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
  "Automatisk skruvlängd – oval enkel/dubbel och runda per fabrikat, med varning när 63mm inte räcker",
];

const COMING = [
  "Inloggning och synkning mellan telefon och dator",
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
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground"><Clock className="size-3.5 text-accent" aria-hidden />Kommer snart</p>
          <ul className="mt-2 space-y-1.5 text-sm font-medium">
            {COMING.map((f) => <li key={f} className="flex items-start gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />{f}</li>)}
          </ul>
        </div>
        <p className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm">Senare blir Pro en prenumeration.</p>
        <Button className="min-h-11 bg-accent font-bold text-accent-foreground hover:bg-accent/85" onClick={() => onOpenChange(false)}>Börja använda Pro gratis</Button>
      </DialogContent>
    </Dialog>
  );
}
