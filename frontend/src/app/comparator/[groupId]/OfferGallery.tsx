"use client";

import { useState } from "react";
import { COMPARATOR_ICONS } from "@/shared/icons";

/** Poza principală (mare) + thumbnails sub ea — click pe un thumbnail schimbă poza principală (stare locală). */
export default function OfferGallery({ images }: { images: string[] }) {
  const [mainIndex, setMainIndex] = useState(0);

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[safeIndex]}
        alt="Poza principală a ofertei"
        className="h-40 w-full rounded-lg border border-line object-cover sm:h-48"
      />
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
