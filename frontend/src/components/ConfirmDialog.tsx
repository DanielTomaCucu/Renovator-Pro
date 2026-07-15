"use client";

import { useLockBodyScroll } from "@/shared/useLockBodyScroll";

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
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useLockBodyScroll(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:backdrop-blur-none"
        onClick={onCancel}
        aria-hidden
      />
      {/* Mobil: bottom sheet (colțuri sus rotunjite, handle bar, butoane full-width stivuite) —
          Desktop (sm+): modal centrat, neschimbat. Vezi design Stitch „Confirmare Ștergere - Bottom Sheet Mobile". */}
      <div className="relative w-full max-w-sm rounded-t-[24px] bg-surface p-6 shadow-2xl sm:rounded-lg sm:shadow-xl">
        <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-line sm:hidden" />
        <h2 className="text-center font-heading text-lg font-semibold sm:text-left">{title}</h2>
        <p className="mt-2 text-center text-sm text-muted sm:text-left">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:gap-3">
          <button
            onClick={onConfirm}
            className="w-full rounded-xl bg-red-600 py-4 text-sm font-bold uppercase tracking-widest text-white transition-transform active:scale-[0.98] sm:flex-1 sm:rounded-md sm:py-2.5 sm:text-sm sm:font-semibold sm:normal-case sm:tracking-normal sm:hover:bg-red-700"
          >
            Șterge
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-xl py-3 text-sm font-medium uppercase tracking-widest text-muted transition-transform hover:bg-surface-low active:scale-[0.98] sm:flex-1 sm:rounded-md sm:border sm:border-line sm:py-2.5 sm:text-sm sm:font-medium sm:normal-case sm:tracking-normal"
          >
            Anulează
          </button>
        </div>
      </div>
    </div>
  );
}
