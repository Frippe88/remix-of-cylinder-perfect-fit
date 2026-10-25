import { createFileRoute } from "@tanstack/react-router";
import { CalculatorPage } from "@/components/calculator-page";
export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Cylinderhjälpen – cylinderkalkylator för låssmeder" },
      { name: "description", content: "Gratis cylinderkalkylator för låssmeder. Räkna fram rätt cylinderförlängare och cylinderringar för oval, rund och iLOQ – enkel- och dubbelcylinder." },
      { name: "application-name", content: "Cylinderhjälpen" },
      { property: "og:site_name", content: "Cylinderhjälpen" },
      { property: "og:title", content: "Cylinderhjälpen – cylinderkalkylator för låssmeder" },
      { property: "og:description", content: "Exakt beräkning av cylinderförlängare och ringar för låssmeder." },
      { property: "og:url", content: "https://cylinderhjalpen.se/" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Cylinderhjälpen" },
    ],
    links: [{ rel: "canonical", href: "https://cylinderhjalpen.se/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Cylinderhjälpen",
          alternateName: "cylinderhjälpen.se",
          url: "https://cylinderhjalpen.se/",
          inLanguage: "sv",
          publisher: {
            "@type": "Organization",
            name: "Cylinderhjälpen",
            url: "https://cylinderhjalpen.se/",
            logo: {
              "@type": "ImageObject",
              url: "https://cylinderhjalpen.se/icon-any-512.png",
              width: 512,
              height: 512,
            },
          },
        }),
      },
    ],

  }),
  component: () => <CalculatorPage variant="free" />,
});
