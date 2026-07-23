"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/shared/nav";

/**
 * Bottom navigation — 4 tab-uri, doar pe mobil (backlog CLAUDE.md: „bottom navigation cu 4 tab-uri").
 * Folosește `mainNav` (aceeași sursă ca `Sidebar`-ul desktop) — iconițe, ordine și stare activă identice
 * indiferent de breakpoint. Eticheta e primul cuvânt din labelul complet (ex. „Configurare Apartament"
 * → „Configurare"), ca să încapă pe 4 coloane fără să trunchieze text.
 */
export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface pt-2.5 md:hidden"
    >
      {mainNav.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active ? "text-secondary" : "text-muted"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={active ? { fontVariationSettings: '"FILL" 1' } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide">
              {item.label.split(" ")[0]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
