"use client";

import { useEffect } from "react";

/**
 * Înregistrează service worker-ul (`public/sw.js`) — necesar pt. instalabilitate (Android/iOS cer un
 * SW activ ca să arate promptul „Adaugă pe ecranul principal"). Fără UI propriu; randează `null`.
 */
export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Best-effort — dacă înregistrarea eșuează (ex. browser vechi, mod privat strict), aplicația
        // rămâne perfect funcțională ca site web obișnuit, doar fără instalabilitate.
      });
    }
  }, []);

  return null;
}
