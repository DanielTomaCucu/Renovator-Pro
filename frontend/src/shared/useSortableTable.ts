"use client";

import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc";

/**
 * Sortare de tabel client-side, generică pe orice coloană cheie `K`. Un singur click pe o coloană
 * sortează ascendent, al doilea click pe aceeași coloană inversează, al treilea revine la ordinea
 * naturală (nesortat) — ciclul standard de sortare pe 3 stări. Comparația e numerică dacă ambele
 * valori sunt numere, altfel string (`localeCompare` cu diacritice RO) — un singur hook acoperă
 * coloane de text ȘI de cifre fără cod separat per tip.
 */
export function useSortableTable<T, K extends string>(
  data: T[],
  getValue: (item: T, key: K) => string | number
) {
  const [sortKey, setSortKey] = useState<K | null>(null);
  const [direction, setDirection] = useState<SortDirection>("asc");

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const va = getValue(a, sortKey);
      const vb = getValue(b, sortKey);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb), "ro");
      return direction === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [data, sortKey, direction, getValue]);

  function toggleSort(key: K) {
    if (sortKey !== key) {
      setSortKey(key);
      setDirection("asc");
    } else if (direction === "asc") {
      setDirection("desc");
    } else {
      setSortKey(null);
      setDirection("asc");
    }
  }

  return { sorted, sortKey, direction, toggleSort };
}
