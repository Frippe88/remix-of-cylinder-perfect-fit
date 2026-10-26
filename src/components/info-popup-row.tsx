import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/** Kompakt rad med kort nyckeltext som öppnar en popup med hela förklaringen. */
export function InfoPopupRow({ label, title, description, children }: { label: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button" className="mt-2 flex w-full items-center gap-2 rounded-lg border-l-4 border-accent bg-accent/10 px-3 py-2.5 text-left text-sm font-bold leading-snug text-foreground transition hover:bg-accent/15">
          <span className="min-w-0 flex-1">{label}</span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-accent">
            Läs mer
            <ChevronRight className="size-4" aria-hidden />
          </span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-lg font-bold">{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="mx-auto mt-2 w-full max-w-xl pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
