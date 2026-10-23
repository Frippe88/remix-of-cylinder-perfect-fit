import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { sitemapPathForLocation, sitemapStaticPaths, sitemapXML, isSitemapRouteIncluded, type SitemapEntry } from "@/lib/sitemap";
import { GUIDES } from "@/lib/guides";

const BASE_URL = "https://cylinderhjalpen.se";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        const router = await getRouterInstance();
        const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
        const routeId = "/guider/$slug";
        if (isSitemapRouteIncluded(router.routesById[routeId])) {
          for (const g of GUIDES) {
            const location = router.buildLocation({
              to: "/guider/$slug",
              params: { slug: g.slug },
              search: () => ({}),
              hash: "",
            });
            const path = sitemapPathForLocation(router, location, routeId);
            if (path) entries.push({ path });
          }
        }
        return new Response(sitemapXML(BASE_URL, entries), {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
