import { Link } from "@tanstack/react-router";

const tabClass =
  "rounded-md px-4 py-2 text-sm font-semibold transition-colors bg-primary-foreground/10 hover:bg-primary-foreground/20";

export function AppTabs() {
  return (
    <nav className="mt-5 flex flex-wrap gap-2" aria-label="Verktyg">
      <Link
        to="/"
        className={tabClass}
        activeOptions={{ exact: true }}
        activeProps={{ className: "!bg-primary-foreground !text-primary" }}
      >
        Cylinderkalkylator
      </Link>
      <Link
        to="/lashus"
        className={tabClass}
        activeProps={{ className: "!bg-primary-foreground !text-primary" }}
      >
        Låshusmanualer
      </Link>
    </nav>
  );
}
