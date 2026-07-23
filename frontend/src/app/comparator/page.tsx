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
import { ComparisonGroup, ComparisonGroupStatus } from "@/shared/types";
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

  // Secțiuni per cameră (ordinea camerelor din apartament) — userul trebuie să vadă dintr-o privire
  // pentru ce cameră e fiecare grup, nu doar dintr-o etichetă mică pe card.
  const roomSections = rooms
    .map((room) => ({ room, groups: visibleGroups.filter((g) => g.roomId === room.id) }))
    .filter((section) => section.groups.length > 0);
  const orphanGroups = visibleGroups.filter((g) => !rooms.some((r) => r.id === g.roomId));

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
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-10">
        <DashboardSummaryCard
          metrics={[
            { label: "Grupuri în analiză", value: String(inAnalizaCount) },
            { label: "Oferte adunate", value: String(totalOffers) },
            { label: "Decise", value: String(decisCount) },
          ]}
        />

        {/* Titlu mobil (PageHeader e ascuns sub md) pe rândul lui; filtrele + butonul Grup Nou pe același rând. */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="basis-full font-heading text-lg font-bold text-primary md:hidden">Comparator Oferte</h1>
          {rooms.length > 1 && (
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setRoomFilter("all")}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
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
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
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
          {rooms.length > 0 && (
            <button
              type="button"
              onClick={() => setDrawer({ open: true })}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-transform hover:opacity-90 active:scale-[0.98] ml-auto"
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
            {visibleGroups.length === 0 ? (
              <EmptyState
                icon={COMPARATOR_ICONS.emptyState}
                title="Niciun grup de comparație încă"
                description="Creează un grup (ex. Gresie baie) și adaugă oferte pe măsură ce le găsești în magazine."
                actionLabel="+ Grup Nou"
                onAction={() => setDrawer({ open: true })}
              />
            ) : (
              <div className="space-y-6">
                {roomSections.map(({ room, groups }) => (
                  <section key={room.id} className="space-y-3">
                    <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                        {ROOM_TYPE_ICONS[room.type]}
                      </span>
                      {room.name}
                      <span className="font-mono normal-case text-muted/70">({groups.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {groups.map((group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          money={money}
                          onDelete={() => setDeleteTargetId(group.id)}
                        />
                      ))}
                    </div>
                  </section>
                ))}

                {orphanGroups.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wide text-muted">
                      Cameră ștearsă <span className="font-mono normal-case text-muted/70">({orphanGroups.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {orphanGroups.map((group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          money={money}
                          onDelete={() => setDeleteTargetId(group.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}
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

/** Cardul unui grup de comparație — camera e deja spusă de secțiunea care înconjoară cardul (`ComparatorPage`). */
function GroupCard({
  group,
  money,
  onDelete,
}: {
  group: ComparisonGroup;
  money: (value: number) => string;
  onDelete: () => void;
}) {
  const range = offerPriceRange(group.offers);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-secondary">
            {group.materialType}
          </p>
          <h3 className="truncate font-heading text-base font-bold text-primary">{group.name}</h3>
        </div>
        <ComparisonGroupStatusChip status={group.status} size="sm" />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="shrink-0 text-xs font-medium text-muted">
          {group.offers.length} {group.offers.length === 1 ? "ofertă" : "oferte"}
        </span>
        <span className="text-right font-mono text-sm font-bold text-primary">
          {range ? (range.min === range.max ? money(range.min) : `${money(range.min)} – ${money(range.max)}`) : "—"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/comparator/${group.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-line py-1.5 text-xs font-semibold text-secondary transition-colors hover:bg-surface-low"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
            {ACTION_ICONS.viewDetails}
          </span>
          Vezi detalii
        </Link>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Șterge grupul"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-low hover:text-tertiary"
        >
          <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.delete}</span>
        </button>
      </div>
    </div>
  );
}
