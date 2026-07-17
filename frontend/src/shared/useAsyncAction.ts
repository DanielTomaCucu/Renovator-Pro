"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Rulează o acțiune (de regulă o mutație de store) și expune `pending` cât timp e în zbor — folosit pentru
 * spinner-ul din butoane. Un singur loc pentru pattern-ul „disabled + spinner cât timp requestul rulează",
 * ca butoanele să nu-și inventeze fiecare propriul `useState`. Click-urile re-entrante (dublu-click) sunt
 * ignorate cât timp `pending` e deja `true` — plasă de siguranță pe lângă `disabled` de pe buton.
 */
export function useAsyncAction<TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<void> | void
) {
  const [pending, setPending] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args: TArgs) => {
      if (pending) return;
      setPending(true);
      try {
        await action(...args);
      } finally {
        // Componenta se poate demonta chiar la finalul acțiunii (ex. ConfirmDialog se închide din onConfirm)
        // — setState pe o componentă demontată dă warning React, deci sărim peste el în acel caz.
        if (mountedRef.current) setPending(false);
      }
    },
    [action, pending]
  );

  return { run, pending };
}
