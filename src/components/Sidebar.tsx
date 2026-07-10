"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/configurare", label: "Configurare Apartament", icon: "🏠" },
  { href: "/elemente", label: "Elemente de Cumpărat", icon: "🛒" },
  { href: "/centralizator", label: "Tabel Centralizator", icon: "📋" },
  { href: "/analiza", label: "Analiză Bugetară", icon: "📊" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-line">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-primary text-white font-bold">
          R
        </div>
        <div>
          <p className="font-heading font-bold leading-tight">Renovator Pro</p>
          <p className="text-xs text-muted uppercase tracking-wide">
            Management Buget
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "text-foreground hover:bg-surface-low"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-line text-xs text-muted">
        © 2026 Renovator Pro.
        <br />
        Arhitectură și Precizie.
      </div>
    </aside>
  );
}
