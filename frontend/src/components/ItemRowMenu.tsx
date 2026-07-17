"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACTION_ICONS } from "@/shared/icons";

/**
 * Meniu „⋮" (3 puncte) pentru acțiunile unui rând de element pe mobil — înlocuiește 3 iconițe
 * separate (vizualizare/editare/ștergere) cu un singur buton compact, ca rândul să respire.
 * Dropdown-ul se randează într-un portal pe `document.body`, poziționat `fixed` după coordonatele
 * reale ale butonului — la fel ca `IconSelectField` (`app/configurare/RoomTechnicalCard.tsx`) — altfel
 * un ancestor cu `overflow-hidden` (cardul camerei) l-ar tăia. Cât timp e deschis, poziția se
 * recalculează la fiecare scroll/resize (capture:true) — altfel scroll cu meniul deschis îl lasă
 * „înghețat", deconectat vizual de buton (bug confirmat anterior pe `IconSelectField`, evitat aici).
 */
export default function ItemRowMenu({
  itemName,
  onView,
  onEdit,
  onDelete,
}: {
  itemName: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateRect = () => {
    if (!buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    setRect({ top: r.bottom + 4, right: window.innerWidth - r.right });
  };

  const toggleOpen = () => {
    if (!open) updateRect();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updateRect, { capture: true, passive: true });
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, { capture: true });
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  function act(fn: () => void) {
    setOpen(false);
    fn();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="p-1 text-muted transition-colors hover:text-primary active:scale-90"
        aria-label={`Acțiuni ${itemName}`}
      >
        <span className="material-symbols-outlined text-[20px]">{ACTION_ICONS.moreVert}</span>
      </button>
      {open &&
        rect &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
            <div
              style={{ top: rect.top, right: rect.right }}
              className="fixed z-50 w-44 overflow-hidden rounded-lg border border-line bg-surface shadow-lg"
            >
              <button
                type="button"
                onClick={() => act(onView)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted hover:bg-surface-low hover:text-secondary"
              >
                <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.viewDetails}</span>
                Vezi detalii
              </button>
              <button
                type="button"
                onClick={() => act(onEdit)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted hover:bg-surface-low hover:text-primary"
              >
                <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.editInline}</span>
                Editează
              </button>
              <button
                type="button"
                onClick={() => act(onDelete)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-tertiary/80 hover:bg-surface-low hover:text-tertiary"
              >
                <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.delete}</span>
                Șterge
              </button>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
