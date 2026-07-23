"use client";

import { ACTION_ICONS } from "@/shared/icons";

/** Poza mărită, full-screen — click pe backdrop sau X închide. Un singur item (spre deosebire de `OfferGallery`, care are thumbnails). */
export default function Lightbox({ image, caption, onClose }: { image: string; caption?: string; onClose: () => void }) {
  // `onPointerUp` alături de `onClick` pe backdrop — pe iOS Safari, un `onClick` simplu pe un `div`
  // nu se declanșează mereu fiabil la tap real. Poza oprește propagarea pentru AMBELE evenimente
  // (altfel un tap pe poză ar închide lightbox-ul prin bubbling de `pointerup`, deși `onClick` era oprit).
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/85 p-4"
      onClick={onClose}
      onPointerUp={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Închide"
        className="absolute right-4 top-4 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.close}</span>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={caption ?? "Poză din Galeria de Inspirație"}
        className="max-h-[85vh] max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
      />
      {caption && <p className="max-w-lg text-center text-sm text-white/80">{caption}</p>}
    </div>
  );
}
