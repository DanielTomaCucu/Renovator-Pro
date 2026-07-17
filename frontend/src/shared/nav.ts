import { NAV_ICONS } from "./icons";

/**
 * Cele 4 secțiuni principale ale aplicației — sursă unică pentru sidebar-ul desktop, dropdown-ul
 * mobil (`Sidebar`) și bottom navigation-ul mobil (`BottomNav`), ca cele trei să rămână mereu identice
 * (iconițe, ordine, stare activă) fără triplă întreținere.
 */
export const mainNav = [
  { href: "/configurare", label: "Configurare Apartament", icon: NAV_ICONS.configurare },
  { href: "/elemente", label: "Elemente de Cumpărat", icon: NAV_ICONS.elemente },
  { href: "/centralizator", label: "Tabel Centralizator", icon: NAV_ICONS.centralizator },
  { href: "/analiza", label: "Grafice Buget", icon: NAV_ICONS.analiza },
];

/** Link secundar (Setări) — doar în footer-ul sidebar-ului desktop și dropdown-ul mobil, NU în bottom nav (4 tab-uri fixe, fără loc pentru un al 5-lea). */
export const secondaryNav = { href: "/setari", label: "Setări", icon: NAV_ICONS.setari };
