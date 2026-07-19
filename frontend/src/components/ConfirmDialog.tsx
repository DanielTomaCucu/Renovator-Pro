"use client";

import { useLockBodyScroll } from "@/shared/useLockBodyScroll";
import { useSwipeToClose } from "@/shared/useSwipeToClose";
import { useAsyncAction } from "@/shared/useAsyncAction";
import Spinner from "./Spinner";

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}) {
  useLockBodyScroll(open);
  // Pending-ul e gestionat aici, intern — consumatorii doar dau mutația în `onConfirm`, fără să-și
  // țină fiecare propriul `useState` de loading.
  const { run: handleConfirm, pending } = useAsyncAction(onConfirm);
  // Tragere-jos dezactivată cât timp ștergerea e în curs — la fel ca backdrop-ul și butoanele.
  const { dragY, dragging, dragHandlers } = useSwipeToClose(pending ? () => {} : onCancel);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:backdrop-blur-none"
        onClick={pending ? undefined : onCancel}
        aria-hidden
      />
      {/* Mobil: bottom sheet tras cu degetul (colțuri sus rotunjite, handle bar, butoane full-width
          stivuite) — Desktop (sm+): modal centrat, neschimbat. Vezi design Stitch „Confirmare Ștergere -
          Bottom Sheet Mobile". */}
      <div
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? "none" : "transform 0.25s ease-out",
        }}
        className="relative w-full max-w-sm rounded-t-[24px] bg-surface p-6 shadow-2xl sm:rounded-lg sm:shadow-xl"
      >
        <div {...dragHandlers} className="-mx-6 -mt-6 touch-none px-6 pt-3 sm:hidden">
          <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-line" />
        </div>
        <h2 className="text-center font-heading text-lg font-semibold sm:text-left">{title}</h2>
        <p className="mt-2 text-center text-sm text-muted sm:text-left">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:gap-3">
          <button
            onClick={handleConfirm}
            disabled={pending}
            aria-busy={pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:rounded-md sm:py-2.5 sm:font-semibold sm:hover:bg-red-700"
          >
            {pending && <Spinner />}
            Șterge
          </button>
          <button
            onClick={onCancel}
            disabled={pending}
            className="w-full rounded-xl py-3 text-sm font-medium text-muted transition-transform hover:bg-surface-low active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:rounded-md sm:border sm:border-line sm:py-2.5"
          >
            Anulează
          </button>
        </div>
      </div>
    </div>
  );
}
