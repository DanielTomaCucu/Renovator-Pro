"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import ComparisonGroupStatusChip from "@/components/ComparisonGroupStatusChip";
import { useStore } from "@/shared/store";
import { formatMoney } from "@/shared/functions";
import { ComparisonGroupStatus, Offer } from "@/shared/types";
import { COMPARATOR_ICONS, ROOM_TYPE_ICONS } from "@/shared/icons";
import { useAsyncAction } from "@/shared/useAsyncAction";
import Spinner from "@/components/Spinner";
import OfferCard from "./OfferCard";
import OfferFormDrawer from "./OfferFormDrawer";
import { OfferDrawerState } from "./OfferDrawerState";
import { cheapestOfferId } from "./offerCompare";

export default function ComparisonGroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { project, rooms, comparisonGroups, deleteOffer, chooseOffer } = useStore();

  const [offerDrawer, setOfferDrawer] = useState<OfferDrawerState>({ open: false });
  const [deleteOfferId, setDeleteOfferId] = useState<string | null>(null);
  const [chooseOfferTarget, setChooseOfferTarget] = useState<Offer | null>(null);

  const group = comparisonGroups.find((g) => g.id === groupId);
  const { run: confirmChoose, pending: choosing } = useAsyncAction(async () => {
    if (!group || !chooseOfferTarget) return;
    await chooseOffer(group.id, chooseOfferTarget.id);
    setChooseOfferTarget(null);
  });

  if (!group) {
    return (
      <div>
        <PageHeader title="Comparator Oferte" showSearch={false} />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
          <EmptyState
            icon={COMPARATOR_ICONS.emptyState}
            title="Grup negăsit"
            description="Grupul de comparație căutat nu (mai) există."
            actionLabel="Înapoi la Comparator"
            actionHref="/comparator"
          />
        </div>
      </div>
    );
  }

  const room = rooms.find((r) => r.id === group.roomId);
  const cheapestId = cheapestOfferId(group.offers);
  const offerToDelete = group.offers.find((o) => o.id === deleteOfferId);

  return (
    <div>
      <PageHeader title={group.name} showSearch={false} />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <Link href="/comparator" className="inline-flex items-center gap-1 text-xs font-bold uppercase text-muted hover:text-primary">
            <span className="material-symbols-outlined icon-btn">arrow_back</span>
            Comparator
          </Link>
          <ComparisonGroupStatusChip status={group.status} size="sm" />
        </div>

        {group.status === ComparisonGroupStatus.Decis && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <span className="material-symbols-outlined icon-btn">{COMPARATOR_ICONS.chosen}</span>
            Ofertă aleasă → element creat.{" "}
            <Link href="/elemente" className="font-bold underline underline-offset-2">
              Vezi în Elemente de Cumpărat
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-1 truncate text-xs font-bold uppercase tracking-wide text-muted">
            {group.offers.length} {group.offers.length === 1 ? "ofertă" : "oferte"}
            <span className="normal-case">
              {" · "}
              {room && (
                <span className="material-symbols-outlined align-middle" style={{ fontSize: 13 }}>
                  {ROOM_TYPE_ICONS[room.type]}
                </span>
              )}{" "}
              {room?.name ?? "Cameră ștearsă"} · {group.materialType}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setOfferDrawer({ open: true })}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-transform hover:opacity-90 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined icon-btn">{COMPARATOR_ICONS.addPhoto}</span>
            Adaugă Ofertă
          </button>
        </div>

        {group.offers.length === 0 ? (
          <EmptyState
            icon={COMPARATOR_ICONS.gallery}
            title="Nicio ofertă adăugată încă"
            description="Adaugă prima ofertă — poți începe doar cu câteva poze, restul le completezi mai târziu."
            actionLabel="+ Adaugă Ofertă"
            onAction={() => setOfferDrawer({ open: true })}
          />
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            {group.offers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                currency={project.currency}
                isCheapest={offer.id === cheapestId}
                isChosen={offer.id === group.chosenOfferId}
                onEdit={() => setOfferDrawer({ open: true, offer })}
                onDelete={() => setDeleteOfferId(offer.id)}
                onChoose={() => setChooseOfferTarget(offer)}
              />
            ))}
          </div>
        )}
      </div>

      <OfferFormDrawer state={offerDrawer} groupId={group.id} onClose={() => setOfferDrawer({ open: false })} />

      <ConfirmDialog
        open={!!offerToDelete}
        title="Confirmare Ștergere"
        message={`Sigur ștergi oferta „${offerToDelete?.name || "fără nume"}"?`}
        onCancel={() => setDeleteOfferId(null)}
        onConfirm={async () => {
          if (!deleteOfferId) return;
          await deleteOffer(deleteOfferId);
          setDeleteOfferId(null);
        }}
      />

      {chooseOfferTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setChooseOfferTarget(null)} aria-hidden />
          <div className="relative w-full max-w-sm rounded-t-[24px] bg-surface p-6 shadow-2xl sm:rounded-lg sm:shadow-xl">
            <h2 className="text-center font-heading text-lg font-semibold sm:text-left">Alege această ofertă?</h2>
            <p className="mt-2 text-center text-sm text-muted sm:text-left">
              Se va crea elementul „{chooseOfferTarget.name || group.name}&rdquo; în camera {room?.name ?? "—"}, la prețul{" "}
              {chooseOfferTarget.unitPrice !== undefined ? formatMoney(chooseOfferTarget.unitPrice, project.currency) : "0"}.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:gap-3">
              <button
                onClick={confirmChoose}
                disabled={choosing}
                aria-busy={choosing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:rounded-md sm:py-2.5 sm:font-semibold"
              >
                {choosing && <Spinner />}
                Alege Oferta
              </button>
              <button
                onClick={() => setChooseOfferTarget(null)}
                disabled={choosing}
                className="w-full rounded-xl py-3 text-sm font-medium text-muted transition-transform hover:bg-surface-low active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:rounded-md sm:border sm:border-line sm:py-2.5"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
