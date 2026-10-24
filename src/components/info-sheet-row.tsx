import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function InfoSheetRow({ icon, title, hint, children }: { icon: ReactNode; title: string; hint: string; children: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button" className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-muted/50">
          <span className="text-accent [&_svg]:size-5" aria-hidden>{icon}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">{title}</span>
            <span className="block truncate text-xs text-muted-foreground">{hint}</span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold"><span className="text-accent [&_svg]:size-5" aria-hidden>{icon}</span>{title}</SheetTitle>
          <SheetDescription>{hint}</SheetDescription>
        </SheetHeader>
        <div className="mx-auto mt-4 w-full max-w-xl pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
