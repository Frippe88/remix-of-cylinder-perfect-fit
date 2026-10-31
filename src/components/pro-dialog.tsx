import { Check, Clock, Download, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import pdfAsset from "@/assets/exempel-projekt.pdf.asset.json";
import { Link } from "@tanstack/react-router";
import { PRO_MONTHLY_SEK } from "@/lib/subscription";

const FEATURES = [
  "Mät och spara dörr för dörr – samla hela bygget i ett projekt",
  "Behörsval (256, 2356, 18256) – visar direkt om det är färdig sats eller lös ring",
  "Automatisk inköpslista för chefen – per cylindertyp med satser, ringpar och förlängare",
  "PDF med ett klick – komplett arbetsorder eller bara inköpslista",
  "Kopiera till mejl/SMS – klistra in beställningen direkt",
  "Flera projekt samtidigt – växla mellan olika byggen och kunder",
  "Molnsynk – konto med inloggning, projekten följer med mellan telefon och dator",
  "Bocka av plocklistan i bilen – synkas mellan dina enheter",
  "Sök bland dörrarna i stora projekt",
  "Automatisk skruvlängd – oval, iLOQ enkel och runda per fabrikat, med varning när 63mm inte räcker",
];

const COMING = [
  "Skruvlängd för dubbel iLOQ",
  "Fler fabrikat och behör",
];

export function ProDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88dvh] max-w-md overflow-y-auto overscroll-contain [&>button:last-child]:rounded-full [&>button:last-child]:bg-card [&>button:last-child]:p-1.5 [&>button:last-child]:opacity-100 [&>button:last-child]:shadow-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8 text-xl"><Star className="size-5 text-accent" aria-hidden />Cylinderkalkyl Pro</DialogTitle>
          <DialogDescription>Pro är i beta och helt gratis att använda just nu. Det här ingår:</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm font-medium">
          {FEATURES.map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />{f}</li>)}
        </ul>
        <a href={pdfAsset.url} download="Cylinderhjalpen_exempel.pdf" className="flex w-full items-center gap-3 rounded-xl border border-accent/40 bg-accent/5 p-3 text-left transition hover:bg-accent/10">
          <FileText className="size-6 shrink-0 text-accent" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">Se hur PDF:en ser ut</span>
            <span className="block text-xs text-muted-foreground">Ladda ner exempel med alla cylindertyper, behör och skruvar</span>
          </span>
          <Download className="size-5 shrink-0 text-accent" aria-hidden />
        </a>
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground"><Clock className="size-3.5 text-accent" aria-hidden />Kommer snart</p>
          <ul className="mt-2 space-y-1.5 text-sm font-medium">
            {COMING.map((f) => <li key={f} className="flex items-start gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />{f}</li>)}
          </ul>
        </div>
        <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm">
          <p><b>{PRO_MONTHLY_SEK} kr/mån</b> exkl. moms · ingen bindningstid · kvitto på mejl.</p>
          <p className="mt-1 text-muted-foreground">Flera tekniker? <Link to="/foretag" className="font-semibold text-accent underline" onClick={() => onOpenChange(false)}>Företagslicens från 99 kr/tekniker</Link></p>
        </div>
        <Button asChild className="min-h-11 bg-accent font-bold text-accent-foreground hover:bg-accent/85">
          <Link to="/konto" onClick={() => onOpenChange(false)}>Köp Pro – {PRO_MONTHLY_SEK} kr/mån</Link>
        </Button>
        <Button variant="outline" className="min-h-10 font-semibold" onClick={() => onOpenChange(false)}>Fortsätt testa gratis (beta)</Button>
      </DialogContent>
    </Dialog>
  );
}
