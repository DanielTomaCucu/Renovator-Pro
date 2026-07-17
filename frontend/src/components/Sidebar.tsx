"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACTION_ICONS, NAV_ICONS } from "@/shared/icons";
import { useLockBodyScroll } from "@/shared/useLockBodyScroll";
import { mainNav as nav, secondaryNav } from "@/shared/nav";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useLockBodyScroll(mobileOpen);

  const currentPageTitle =
    [...nav, secondaryNav].find((item) => pathname.startsWith(item.href))?.label ??
    "Renovator Pro";

  return (
    <>
      {/* Bară + meniu mobil — vizibile doar sub breakpoint-ul md, unde <aside> dispare.
          Închis: bara arată titlul paginii curente. Deschis: panoul dropdown arată logo-ul
          + numele aplicației deasupra linkurilor de navigare (vezi cererea userului). */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-surface-low px-4 py-3 md:hidden">
        <span className="truncate font-heading text-base font-bold text-primary">
          {currentPageTitle}
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Închide meniul" : "Deschide meniul"}
          aria-expanded={mobileOpen}
          className="shrink-0 rounded-lg p-2 text-primary hover:bg-surface"
        >
          <span className="material-symbols-outlined">
            {mobileOpen ? ACTION_ICONS.close : NAV_ICONS.mobileMenu}
          </span>
        </button>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav
        className={`fixed left-0 right-0 top-[57px] z-40 origin-top border-b border-line bg-surface shadow-lg transition-all duration-200 md:hidden ${
          mobileOpen ? "scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-line p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              {NAV_ICONS.logo}
            </span>
          </div>
          <div className="min-w-0 whitespace-nowrap">
            <p className="font-heading text-[15px] font-extrabold leading-tight text-primary">
              Renovator Pro
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted opacity-60">
              Management Buget
            </p>
          </div>
        </div>
        <div className="space-y-0.5 p-3">
          {[...nav, secondaryNav].map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                  active
                    ? "bg-secondary/10 text-secondary"
                    : "text-muted hover:bg-surface-low hover:text-primary"
                }`}
              >
                <span
                  className="material-symbols-outlined shrink-0 text-[20px]"
                  style={active ? { fontVariationSettings: '"FILL" 1' } : undefined}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

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
          <div className="min-w-0 whitespace-nowrap">
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
        <div className="space-y-0.5">
          <Link
            href={secondaryNav.href}
            title={collapsed ? secondaryNav.label : undefined}
            className={`flex items-center rounded-lg transition-all ${
              collapsed ? "justify-center p-2" : "gap-3 px-3 py-1.5"
            } ${
              pathname.startsWith(secondaryNav.href)
                ? "bg-secondary/10 text-secondary"
                : "text-muted hover:bg-surface hover:text-primary"
            }`}
          >
            <span
              className="material-symbols-outlined shrink-0 text-[20px]"
              style={pathname.startsWith(secondaryNav.href) ? { fontVariationSettings: '"FILL" 1' } : undefined}
            >
              {secondaryNav.icon}
            </span>
            {!collapsed && <span className="truncate text-sm font-medium">{secondaryNav.label}</span>}
          </Link>

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
    </>
  );
}
