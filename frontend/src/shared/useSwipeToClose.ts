"use client";

import { useCallback, useRef, useState } from "react";

/** Distanța (px) de la care o tragere-jos e interpretată ca „închide", nu revenire la poziția inițială. */
const CLOSE_THRESHOLD_PX = 120;

/**
 * Gest de tragere-jos pentru bottom sheet-urile mobile (comportament nativ) — se atașează DOAR pe
 * zona de handle/header a sheet-ului (nu pe corpul scrollabil), ca scroll-ul conținutului să rămână
 * neatins. La eliberare: peste prag → `onClose`; sub prag → sheet-ul revine animat la poziția inițială.
 */
export function useSwipeToClose(onClose: () => void) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  // Ref-uri (nu doar state) pentru poarta activ/inactiv și ultima valoare de tragere — citite
  // sincron, fără să aștepte un re-render. Două motive: (1) batching-ul React ar lăsa `dragging`
  // (state) stale între pointerdown și primul pointermove dacă vin foarte apropiate; (2) apelarea
  // lui `onClose` (setState pe un component PĂRINTE) din interiorul unui updater funcțional de-al
  // lui `setDragY` declanșează eroarea React „Cannot update a component while rendering a different
  // component" — deci `onClose` trebuie chemat separat, ca instrucțiune de sine stătătoare, nu imbricat.
  const activeRef = useRef(false);
  const dragYRef = useRef(0);

  const setDrag = useCallback((y: number) => {
    dragYRef.current = y;
    setDragY(y);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    startY.current = e.clientY;
    activeRef.current = true;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activeRef.current) return;
      const delta = e.clientY - startY.current;
      if (delta > 0) setDrag(delta);
    },
    [setDrag]
  );

  const endDrag = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setDragging(false);
    const shouldClose = dragYRef.current > CLOSE_THRESHOLD_PX;
    setDrag(0);
    if (shouldClose) onClose();
  }, [onClose, setDrag]);

  return {
    dragY,
    dragging,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
