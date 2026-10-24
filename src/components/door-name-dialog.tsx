import { useEffect, useState } from "react";
import { DoorOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function DoorNameDialog({ open, defaultName, projectName, onCancel, onConfirm }: {
  open: boolean; defaultName: string; projectName: string; onCancel: () => void; onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  useEffect(() => { if (open) setName(defaultName); }, [open, defaultName]);
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-sm rounded-xl">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2"><DoorOpen className="size-5 text-accent" aria-hidden />Spara dörr</DialogTitle>
          <DialogDescription>Läggs till i {projectName.trim() ? `”${projectName.trim()}”` : "projektet"}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onConfirm(name.trim() || defaultName); }} className="space-y-4">
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onFocus={(e) => e.currentTarget.select()} enterKeyHint="done"
            aria-label="Namn på dörren" placeholder="t.ex. Entrédörr"
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base" />
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button type="button" variant="outline" className="h-11 flex-1 sm:flex-none" onClick={onCancel}>Avbryt</Button>
            <Button type="submit" className="h-11 flex-1 bg-accent font-semibold text-accent-foreground hover:bg-accent/85 sm:flex-none">Spara dörr</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
