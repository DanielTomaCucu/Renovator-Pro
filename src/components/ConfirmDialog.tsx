"use client";

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden />
      <div className="relative w-full max-w-sm rounded-lg bg-surface p-6 shadow-xl">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-md border border-line py-2.5 text-sm font-medium hover:bg-surface-low"
          >
            Anulează
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-md bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            Șterge
          </button>
        </div>
      </div>
    </div>
  );
}
