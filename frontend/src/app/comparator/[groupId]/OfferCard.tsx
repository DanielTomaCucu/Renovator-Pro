"use client";

import { Currency, Offer } from "@/shared/types";
import { formatMoney } from "@/shared/functions";
import { ACTION_ICONS, COMPARATOR_ICONS } from "@/shared/icons";
import { safeHttpUrl } from "@/shared/functions";
import OfferGallery from "./OfferGallery";

export default function OfferCard({
  offer,
  currency,
  isCheapest,
  isChosen,
  onEdit,
  onDelete,
  onChoose,
  onViewDetails,
}: {
  offer: Offer;
  currency: Currency;
  isCheapest: boolean;
  isChosen: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onChoose: () => void;
  onViewDetails: () => void;
}) {
  const total =
    offer.unitPrice !== undefined && offer.quantity !== undefined ? offer.unitPrice * offer.quantity : undefined;
  const productLink = safeHttpUrl(offer.productUrl);

  return (
    <div
      className={`flex w-full flex-col gap-3 rounded-xl border bg-surface p-4 shadow-sm ${
        isChosen ? "border-emerald-400 ring-1 ring-emerald-400" : "border-line"
      }`}
    >
      <OfferGallery images={offer.images} />

      <div className="flex items-start justify-between gap-2">
        <h4 className="min-w-0 flex-1 truncate font-heading text-sm font-bold text-primary">
          {offer.name || "Fără nume"}
        </h4>
        {isCheapest && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
            <span className="material-symbols-outlined" style={{ fontSize: 10 }}>
              {COMPARATOR_ICONS.bestPrice}
            </span>
            Cel mai bun preț
          </span>
        )}
      </div>

      {offer.store && <p className="text-xs font-medium text-muted">{offer.store}</p>}

      <div className="flex items-baseline justify-between">
        <span className="font-mono text-lg font-bold text-primary">
          {offer.unitPrice !== undefined ? formatMoney(offer.unitPrice, currency) : "—"}
        </span>
        {offer.quantity !== undefined && (
          <span className="font-mono text-xs text-muted">
            × {offer.quantity} {total !== undefined && `= ${formatMoney(total, currency)}`}
          </span>
        )}
      </div>

      {productLink && (
        <a
          href={productLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-secondary hover:underline"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            {COMPARATOR_ICONS.externalLink}
          </span>
          Deschide produsul
        </a>
      )}

      {offer.notes && <p className="whitespace-pre-wrap text-xs text-muted">{offer.notes}</p>}

      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
        <button
          type="button"
          onClick={onChoose}
          disabled={isChosen}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary py-2 text-xs font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined icon-btn">{COMPARATOR_ICONS.choose}</span>
          {isChosen ? "Aleasă" : "Alege"}
        </button>
        <button
          type="button"
          onClick={onViewDetails}
          aria-label="Vezi detaliile ofertei"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-low"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
            {ACTION_ICONS.viewDetails}
          </span>
        </button>
        <button
          type="button"
          onClick={onEdit}
          aria-label="Editează oferta"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-low"
        >
          <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.editInline}</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Șterge oferta"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-low hover:text-tertiary"
        >
          <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.delete}</span>
        </button>
      </div>
    </div>
  );
}
