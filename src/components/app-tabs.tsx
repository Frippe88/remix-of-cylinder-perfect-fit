import { Link } from "@tanstack/react-router";

export function AppTabs() {
  const base = "rounded-md px-3 py-1.5 text-sm font-semibold transition";
  return (
    <nav className="mt-4 inline-flex gap-1 rounded-lg bg-primary-foreground/10 p-1">
      <Link to="/" activeOptions={{ exact: true }} className={base} activeProps={{ className: "bg-primary-foreground text-primary" }} inactiveProps={{ className: "opacity-80 hover:opacity-100" }}>
        Cylinder
      </Link>
      <Link to="/stolpvaljare" className={base} activeProps={{ className: "bg-primary-foreground text-primary" }} inactiveProps={{ className: "opacity-80 hover:opacity-100" }}>
        Stolpväljare
      </Link>
    </nav>
  );
}
