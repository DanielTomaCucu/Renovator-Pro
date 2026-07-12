"use client";

import { NAV_ICONS } from "@/shared/icons";

export default function PageHeader({
  title,
  searchPlaceholder = "Caută...",
  actions,
}: {
  title: string;
  searchPlaceholder?: string;
  /** Sloturi opționale de butoane afișate lângă căutare (ex: Export PDF). */
  actions?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-10">
        <h1 className="font-heading text-xl font-bold text-primary lg:text-2xl">{title}</h1>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-muted">
              {NAV_ICONS.search}
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-72 rounded-lg border border-line bg-surface-low py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          {actions}
        </div>
      </div>
    </header>
  );
}
