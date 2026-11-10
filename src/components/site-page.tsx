import { Link } from "@tanstack/react-router";
import { ArrowLeft, KeyRound } from "lucide-react";
import type { ReactNode } from "react";

/** Shared frosted top bar + hero for all content pages (matches the calculator header). */
export function SitePageHeader({ backTo = "/", backLabel = "Kalkylatorn" }: { backTo?: "/" | "/pro" | "/guider"; backLabel?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link to={backTo} className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <ArrowLeft className="size-4" />{backLabel}
        </Link>
        <Link to="/" className="flex items-center gap-2 text-sm font-extrabold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent/15 text-accent"><KeyRound className="size-4" /></span>
          Cylinderhjälpen
        </Link>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
    </header>
  );
}

export function PageHero({ eyebrow, icon, title, children }: { eyebrow?: string; icon?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="space-y-3">
      {eyebrow && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
          {icon}{eyebrow}
        </span>
      )}
      <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</h1>
      {children && <p className="max-w-prose text-base text-muted-foreground sm:text-lg">{children}</p>}
    </div>
  );
}

export const cardLift = "rounded-2xl border bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg";
