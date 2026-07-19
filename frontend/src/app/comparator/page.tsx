"use client";

import { useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import DashboardSummaryCard from "@/components/DashboardSummaryCard";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import ComparisonGroupStatusChip from "@/components/ComparisonGroupStatusChip";
import { useStore } from "@/shared/store";
import { formatMoney } from "@/shared/functions";
import { ComparisonGroupStatus } from "@/shared/types";
import { ACTION_ICONS, COMPARATOR_ICONS, ROOM_TYPE_ICONS } from "@/shared/icons";
import GroupFormDrawer from "./GroupFormDrawer";
import { GroupDrawerState } from "./GroupDrawerState";
import { offerPriceRange } from "./groupOffers";

export default function ComparatorPage() {
  const { project, rooms, comparisonGroups, deleteComparisonGroup } = useStore();
  const money = (value: number) => formatMoney(value, project.currency);

  const [roomFilter, setRoomFilter] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<GroupDrawerState>({ open: false });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const visibleGroups = comparisonGroups
    .filter((g) => roomFilter === "all" || g.roomId === roomFilter)
    .filter((g) => g.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const inAnalizaCount = comparisonGroups.filter((g) => g.status === ComparisonGroupStatus.InAnaliza).length;
  const decisCount = comparisonGroups.filter((g) => g.status === ComparisonGroupStatus.Decis).length;
  const totalOffers = comparisonGroups.reduce((sum, g) => sum + g.offers.length, 0);

  const deleteTarget = comparisonGroups.find((g) => g.id === deleteTargetId);

  return (
    <div>
      <PageHeader
        title="Comparator Oferte"
        searchPlaceholder="Caută grup..."
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          rooms.length > 0 && (
            <button
              type="button"
              onClick={() => setDrawer({ open: true })}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:opacity-90 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined icon-btn">{COMPARATOR_ICONS.newGroup}</span>
              Grup Nou
            </button>
          )
        }
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-10">
        <DashboardSummaryCard
          metrics={[
            { label: "Grupuri în analiză", value: String(inAnalizaCount) },
            { label: "Oferte adunate", value: String(totalOffers) },
            { label: "Decise", value: String(decisCount) },
          ]}
        />

        {/* Header mobil (fără PageHeader vizibil sub md) + buton Grup Nou */}
        <div className="flex items-center justify-between gap-3 md:hidden">
          <h1 className="font-heading text-lg font-bold text-primary">Comparator Oferte</h1>
          {rooms.length > 0 && (
            <button
              type="button"
              onClick={() => setDrawer({ open: true })}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold uppercase text-white active:scale-[0.98]"
            >
              <span className="material-symbols-outlined icon-btn">{COMPARATOR_ICONS.newGroup}</span>
              Grup Nou
            </button>
          )}
        </div>

        {rooms.length === 0 ? (
          <EmptyState
            icon={COMPARATOR_ICONS.emptyState}
            title="Ai nevoie de o cameră mai întâi"
            description="Comparatorul de oferte se leagă de o cameră a apartamentului — adaugă o cameră din Configurare Apartament, apoi revino aici."
            actionLabel="Mergi la Configurare"
            actionHref="/configurare"
          />
        ) : (
          <>
            {rooms.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setRoomFilter("all")}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                    roomFilter === "all"
                      ? "border-primary bg-primary text-white"
                      : "border-line text-muted hover:bg-surface-low"
                  }`}
                >
                  Toate camerele
                </button>
                {rooms.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoomFilter(r.id)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                      roomFilter === r.id
                        ? "border-primary bg-primary text-white"
                        : "border-line text-muted hover:bg-surface-low"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      {ROOM_TYPE_ICONS[r.type]}
                    </span>
                    {r.name}
                  </button>
                ))}
              </div>
            )}

            {visibleGroups.length === 0 ? (
              <EmptyState
                icon={COMPARATOR_ICONS.emptyState}
                title="Niciun grup de comparație încă"
                description="Creează un grup (ex. Gresie baie) și adaugă oferte pe măsură ce le găsești în magazine."
                actionLabel="+ Grup Nou"
                onAction={() => setDrawer({ open: true })}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleGroups.map((group) => {
                  const room = rooms.find((r) => r.id === group.roomId);
                  const range = offerPriceRange(group.offers);
                  return (
                    <div
                      key={group.id}
                      className="group relative flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <Link href={`/comparator/${group.id}`} className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate font-heading text-base font-bold text-primary">
                              {group.name}
                            </h3>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                              {room && (
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                                  {ROOM_TYPE_ICONS[room.type]}
                                </span>
                              )}
                              {room?.name ?? "Cameră ștearsă"} · {group.materialType}
                            </p>
                          </div>
                          <ComparisonGroupStatusChip status={group.status} size="sm" />
                        </div>

                        <div className="flex items-center justify-between border-t border-line pt-3">
                          <span className="text-xs font-bold uppercase tracking-wide text-muted">
                            {group.offers.length} {group.offers.length === 1 ? "ofertă" : "oferte"}
                          </span>
                          <span className="font-mono text-sm font-bold text-primary">
                            {range ? (range.min === range.max ? money(range.min) : `${money(range.min)} – ${money(range.max)}`) : "—"}
                          </span>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(group.id)}
                        aria-label="Șterge grupul"
                        className="icon-btn absolute right-3 top-3 rounded-full p-1.5 text-muted opacity-0 hover:bg-surface-low hover:text-tertiary group-hover:opacity-100 focus:opacity-100"
                      >
                        <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.delete}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <GroupFormDrawer state={drawer} onClose={() => setDrawer({ open: false })} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Confirmare Ștergere"
        message={`Sigur ștergi grupul „${deleteTarget?.name}"? Ofertele adunate se pierd definitiv; elementul deja creat din el (dacă există) rămâne în Elemente de Cumpărat.`}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (!deleteTargetId) return;
          await deleteComparisonGroup(deleteTargetId);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
