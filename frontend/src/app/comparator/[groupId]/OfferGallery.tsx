"use client";

import { useState } from "react";
import { ACTION_ICONS, COMPARATOR_ICONS } from "@/shared/icons";

/**
 * Poza principală (mare) + thumbnails sub ea — click pe un thumbnail schimbă poza principală (stare
 * locală); click pe poza principală deschide un lightbox full-screen cu poza la dimensiune mare.
 */
export default function OfferGallery({ images }: { images: string[] }) {
  const [mainIndex, setMainIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-lg bg-surface-low text-muted/50">
        <span className="material-symbols-outlined text-4xl">{COMPARATOR_ICONS.gallery}</span>
      </div>
    );
  }

  const safeIndex = Math.min(mainIndex, images.length - 1);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="block w-full cursor-zoom-in"
        aria-label="Vezi poza mărită"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[safeIndex]}
          alt="Poza principală a ofertei"
          className="h-40 w-full rounded-lg border border-line object-cover sm:h-48"
        />
      </button>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Închide"
            className="absolute right-4 top-4 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.close}</span>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[safeIndex]}
            alt="Poza mărită a ofertei"
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMainIndex(i)}
              className={`h-12 w-12 shrink-0 overflow-hidden rounded border-2 transition-colors ${
                i === safeIndex ? "border-secondary" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Poză ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
