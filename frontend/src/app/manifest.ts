import type { MetadataRoute } from "next";

/**
 * PWA — instalabilă pe Android/iOS direct din browser, fără magazin de aplicații. Convenție specială
 * Next.js App Router (`app/manifest.ts`) — link-ul `<head>` e generat automat, nu trebuie legat manual.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Renovator Pro — Planificator Buget Renovare",
    short_name: "Renovator Pro",
    description: "Management de buget pentru renovări de locuințe.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f9ff",
    theme_color: "#000000",
    lang: "ro",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
