"use client";

import { useEffect } from "react";

/** Blochează scroll-ul paginii din spate cât timp un overlay (drawer/dialog) e deschis. */
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}
