"use client";

import { type ReactNode } from "react";
import { useLockBodyScroll } from "@/shared/useLockBodyScroll";
import { useSwipeToClose } from "@/shared/useSwipeToClose";

/**
 * Volet — un singur arbore DOM, stilizat responsive strict prin clase Tailwind (ca `ConfirmDialog`),
 * NU două randări separate mobil/desktop (ar duplica id-uri de formular și ar rupe `form="..."` de pe
 * butoanele din footer). Header-ul și footer-ul (opțional) rămân fixe sus/jos — doar `children` scrolează,
 * indiferent cât conținut are (puțin sau mult).
 * Mobil: bottom sheet nativ — se trage cu degetul de pe zona de handle pentru închidere (`useSwipeToClose`).
 * Tabletă/Desktop (md+): volet clasic din dreapta, pe toată înălțimea ecranului.
 */
export default function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useLockBodyScroll(open);
  const { dragY, dragging, dragHandlers } = useSwipeToClose(onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      <div
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? "none" : "transform 0.25s ease-out",
        }}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-[24px] bg-surface shadow-2xl md:absolute md:inset-x-auto md:inset-y-0 md:right-0 md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:shadow-xl"
      >
        {/* Handle bar — zonă de tragere, doar mobil (pe desktop se închide cu X sau click pe backdrop). */}
        <div {...dragHandlers} className="flex shrink-0 touch-none justify-center pb-1 pt-3 md:hidden">
          <div className="h-1.5 w-12 rounded-full bg-line" />
        </div>

        {/* Pe mobil: fără X (se închide prin tragere/backdrop), titlu centrat — pe desktop: X + titlu la stânga. */}
        <div className="flex shrink-0 items-center justify-center border-b border-line px-6 py-4 md:justify-between">
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="hidden rounded p-1 text-muted hover:bg-surface-low md:block"
            aria-label="Închide"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && <div className="shrink-0 border-t border-line p-4 md:p-6">{footer}</div>}
      </div>
    </div>
  );
}
