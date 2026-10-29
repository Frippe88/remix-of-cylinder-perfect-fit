import { useState } from "react";
import { KeyRound, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthForm } from "@/components/auth-form";

export function ProLoginBar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="mx-auto flex max-w-5xl items-center gap-2 rounded-xl border border-accent/40 bg-accent/5 px-3 py-2.5 shadow-card sm:gap-3 sm:px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent sm:size-9">
          <Star className="size-4 text-accent-foreground sm:size-5" aria-hidden />
        </span>
        <p className="min-w-0 flex-1 text-xs leading-snug font-semibold sm:text-sm">
          Logga in för Pro – spara dörrar i projekt, plocklista, PDF och skruvlängder.
        </p>
        <Button type="button" size="sm" className="min-h-10 shrink-0 bg-accent font-bold text-accent-foreground hover:bg-accent/85" onClick={() => setOpen(true)}>
          <KeyRound className="size-4" aria-hidden />Logga in
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-0">
          <AuthForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
