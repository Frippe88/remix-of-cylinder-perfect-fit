import { useState } from "react";
import { KeyRound, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthForm } from "@/components/auth-form";

export function ProLoginBar() {
  const [open, setOpen] = useState<"in" | "up" | null>(null);
  return (
    <>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 rounded-xl border border-accent/40 bg-accent/5 px-3 py-2.5 shadow-card sm:gap-3 sm:px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent sm:size-9">
          <Star className="size-4 text-accent-foreground sm:size-5" aria-hidden />
        </span>
        <p className="min-w-0 flex-1 text-xs leading-snug font-semibold sm:text-sm">
          Pro: Mät bygget dörr för dörr. Kalkylatorn räknar automatiskt ut ringar, förlängare, behör och skruv – färdig inköpslista i PDF med ett klick.
        </p>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <Button type="button" size="sm" className="min-h-10 flex-1 bg-accent font-bold text-accent-foreground hover:bg-accent/85 sm:flex-none" onClick={() => setOpen("up")}>
            <KeyRound className="size-4" aria-hidden />Skapa konto
          </Button>
          <Button type="button" size="sm" variant="outline" className="min-h-10 flex-1 font-semibold sm:flex-none" onClick={() => setOpen("in")}>
            Logga in
          </Button>
        </div>
      </div>
      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-0">
          <AuthForm key={open ?? "in"} initialMode={open ?? "in"} />
        </DialogContent>
      </Dialog>
    </>
  );
}
