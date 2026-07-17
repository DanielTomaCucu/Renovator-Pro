"use client";

import { ACTION_ICONS } from "@/shared/icons";
import type { SortDirection } from "@/shared/useSortableTable";

/** Header de tabel clicabil pentru sortare — înlocuiește iconița statică `unfold_more` cu una reală. */
export default function SortableTh<K extends string>({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align = "left",
  className = "",
}: {
  label: string;
  sortKey: K;
  activeKey: K | null;
  direction: SortDirection;
  onSort: (key: K) => void;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  const active = activeKey === sortKey;
  const icon = active
    ? direction === "asc"
      ? ACTION_ICONS.sortAscending
      : ACTION_ICONS.sortDescending
    : ACTION_ICONS.sortIndicator;

  return (
    <th
      className={`whitespace-nowrap px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-label={`Sortează după ${label}`}
        className={`inline-flex items-center gap-1 transition-colors hover:text-primary ${
          align === "right" ? "flex-row-reverse" : align === "center" ? "justify-center" : ""
        } ${active ? "text-primary" : ""}`}
      >
        {label}
        <span
          className={`material-symbols-outlined text-[14px] ${active ? "opacity-100" : "opacity-40"}`}
        >
          {icon}
        </span>
      </button>
    </th>
  );
}
