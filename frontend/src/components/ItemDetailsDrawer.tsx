"use client";

import { type ReactNode } from "react";
import Drawer from "./Drawer";
import StatusChip from "./StatusChip";
import OriginBadge from "./OriginBadge";
import { useStore } from "@/shared/store";
import { formatMoney, itemTotal } from "@/shared/functions";
import { Item } from "@/shared/types";
import { ACTION_ICONS, ROOM_TYPE_ICONS } from "@/shared/icons";

/** Formatează o dată ISO 8601 în „zi lună an", ro-RO — folosit doar aici (adăugat/cumpărat în Detalii Element). */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/60 py-2.5 last:border-0">
      <dt className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-right text-sm text-primary">{value}</dd>
    </div>
  );
}

/**
 * Volet read-only cu detaliile unui element — fără câmpuri de editare (doar afișare + buton „Editează").
 * Folosește `Drawer` (header „Detalii Element" fix sus, buton „Editează" fix jos, bottom sheet
 * tras cu degetul pe mobil) — nu duplică layout-ul de volet, doar conținutul specific.
 */
export default function ItemDetailsDrawer({
  open,
  item,
  onClose,
  onEdit,
}: {
  open: boolean;
  item?: Item | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { rooms, project } = useStore();

  if (!open || !item) return null;

  const room = rooms.find((r) => r.id === item.roomId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Detalii Element"
      footer={
        <button
          type="button"
          onClick={onEdit}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.editItem}</span>
          Editează
        </button>
      }
    >
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.name}
          className="mb-5 h-52 w-full rounded-xl border border-line object-cover"
        />
      )}

      <div className="mb-4">
        <h3 className="font-heading text-lg font-bold text-primary">{item.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusChip status={item.status} size="sm" />
          <OriginBadge origin={item.origin} />
        </div>
      </div>

      <dl>
        <DetailRow
          label="Cameră"
          value={
            room ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined icon-btn text-secondary">
                  {ROOM_TYPE_ICONS[room.type]}
                </span>
                {room.name}
              </span>
            ) : (
              "—"
            )
          }
        />
        <DetailRow label="Tip element" value={item.materialType} />
        <DetailRow label="Sursă / Magazin" value={item.source || "—"} />
        <DetailRow label="Cantitate" value={<span className="font-mono">{item.quantity} buc</span>} />
        <DetailRow
          label="Preț unitar"
          value={<span className="font-mono">{formatMoney(item.unitPrice, project.currency)}</span>}
        />
        <DetailRow
          label="Total"
          value={
            <span className="font-mono font-bold text-primary">
              {formatMoney(itemTotal(item), project.currency)}
            </span>
          }
        />
        {item.productUrl && (
          <DetailRow
            label="Link produs"
            value={
              <a
                href={item.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-secondary hover:underline"
              >
                <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.link}</span>
                Deschide
              </a>
            }
          />
        )}
        <DetailRow label="Adăugat" value={formatDate(item.createdAt)} />
        {item.purchasedAt && <DetailRow label="Cumpărat" value={formatDate(item.purchasedAt)} />}
      </dl>
    </Drawer>
  );
}
