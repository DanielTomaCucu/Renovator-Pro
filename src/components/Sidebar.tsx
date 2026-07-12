"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ICONS } from "@/shared/icons";

const nav = [
  { href: "/configurare", label: "Configurare Apartament", icon: NAV_ICONS.configurare },
  { href: "/elemente", label: "Elemente de Cumpărat", icon: NAV_ICONS.elemente },
  { href: "/centralizator", label: "Tabel Centralizator", icon: NAV_ICONS.centralizator },
  { href: "/analiza", label: "Grafice Buget", icon: NAV_ICONS.analiza },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex h-screen shrink-0 flex-col border-r border-line bg-surface-low transition-all duration-300 sticky top-0 ${
        collapsed ? "w-20 p-3" : "w-64 p-4"
      }`}
    >
      <div
        className={`flex items-center gap-3 border-b border-line pb-4 ${
          collapsed ? "justify-center" : "px-1"
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            {NAV_ICONS.logo}
          </span>
        </div>
        {!collapsed && (
          <div className="whitespace-nowrap">
            <h1 className="font-heading text-[20px] font-extrabold leading-tight text-primary">
              Renovator Pro
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted opacity-60">
              Management Buget
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 py-4">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center rounded-lg transition-all ${
                collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2"
              } ${
                active
                  ? "bg-secondary/10 text-secondary shadow-sm"
                  : "text-muted hover:bg-surface hover:text-primary"
              }`}
            >
              <span
                className="material-symbols-outlined shrink-0 text-[20px]"
                style={active ? { fontVariationSettings: '"FILL" 1' } : undefined}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
        <span
          title="Galerie Inspirație (indisponibil)"
          className={`flex cursor-not-allowed items-center text-muted opacity-50 ${
            collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2"
          }`}
        >
          <span className="material-symbols-outlined shrink-0 text-[20px]">
            {NAV_ICONS.galerie}
          </span>
          {!collapsed && <span className="truncate text-sm font-medium">Galerie Inspirație</span>}
        </span>
      </nav>

      <div className="space-y-2 border-t border-line pt-3">
        <Link
          href="/configurare"
          title={collapsed ? "Adaugă Cameră" : undefined}
          className={`flex w-full items-center rounded-lg bg-primary font-bold text-white shadow-md transition-all hover:bg-opacity-90 active:scale-95 ${
            collapsed ? "justify-center py-2.5" : "justify-center gap-2 py-2.5"
          }`}
        >
          <span className="material-symbols-outlined shrink-0 text-[20px]">
            {NAV_ICONS.sidebarAddRoom}
          </span>
          {!collapsed && <span className="truncate text-sm font-medium">Adaugă Cameră</span>}
        </Link>

        <div className="space-y-0.5">
          <span
            title="Setări (indisponibil)"
            className={`flex cursor-not-allowed items-center text-muted opacity-50 ${
              collapsed ? "justify-center p-2" : "gap-3 px-3 py-1.5"
            }`}
          >
            <span className="material-symbols-outlined shrink-0 text-[20px]">
              {NAV_ICONS.setari}
            </span>
            {!collapsed && <span className="truncate text-sm font-medium">Setări</span>}
          </span>

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={`group flex w-full items-center text-muted transition-colors hover:text-primary ${
              collapsed ? "justify-center p-2" : "gap-3 px-3 py-1.5"
            }`}
          >
            <span
              className={`material-symbols-outlined shrink-0 text-[20px] transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            >
              {NAV_ICONS.collapseSidebar}
            </span>
            {!collapsed && <span className="truncate text-sm font-medium">Restrânge</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
