import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const KEY = "cookie-notice-ok";

export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(localStorage.getItem(KEY) !== "1"); } catch { /* ignore */ }
  }, []);
  if (!show) return null;
  const ok = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setShow(false);
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-foreground text-background">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5 text-xs sm:text-sm">
        <p className="flex-1">
          Vi använder cookies för inloggning och anonym statistik.{" "}
          <Link to="/villkor" className="underline underline-offset-2 opacity-80 hover:opacity-100">Läs mer</Link>
        </p>
        <button
          type="button"
          onClick={ok}
          className="shrink-0 rounded-md bg-primary px-4 py-1.5 font-semibold text-primary-foreground hover:opacity-90"
        >
          Okej
        </button>
      </div>
    </div>
  );
}
