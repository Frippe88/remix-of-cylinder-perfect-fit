// Google Analytics 4 (gtag.js). Mät-ID är publikt (syns alltid i webbläsaren).
// Laddas bara på den publicerade sajten — aldrig i förhandsvisning/lokalt.
export const GA_MEASUREMENT_ID = "G-87Y3ESSWHT";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag }
}

function enabled() {
  if (typeof window === "undefined" || import.meta.env.DEV) return false;
  const h = window.location.hostname;
  return !h.includes("lovable") && h !== "localhost";
}

export function initAnalytics() {
  if (!enabled() || window.gtag) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("set", "developer_id.dZjgwMW", true);
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
}

export function trackPageView(path: string) {
  window.gtag?.("event", "page_view", { page_path: path });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}
