"use client";

import { useState } from "react";
import Link from "next/link";
import StatusChip from "@/components/StatusChip";
import OriginBadge from "@/components/OriginBadge";
import DashboardSummaryCard, { SummaryProgressFooter } from "@/components/DashboardSummaryCard";
import ItemFormDrawer from "@/components/ItemFormDrawer";
import ItemDetailsDrawer from "@/components/ItemDetailsDrawer";
import ItemRowMenu from "@/components/ItemRowMenu";
import RoomFormDrawer from "@/components/RoomFormDrawer";
import ConfirmDialog from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";
import SortableTh from "@/components/SortableTh";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";
import { DecimalInput } from "@/components/forms";
import { useStore } from "@/shared/store";
import { useAsyncAction } from "@/shared/useAsyncAction";
import {
  boughtCount,
  formatMoney,
  itemTotal,
  itemsForRoom,
  materialUnit,
  roomSpent,
} from "@/shared/functions";
import { useSortableTable } from "@/shared/useSortableTable";
import { Item, ItemOrigin, ItemStatus, MaterialType } from "@/shared/types";
import { ACTION_ICONS, COMPARATOR_ICONS, ROOM_TYPE_ICONS, TECHNICAL_ICONS } from "@/shared/icons";
import { DeleteTarget } from "./DeleteTarget";
import { decidedGroupForItem } from "./decidedGroupForItem";
import { ItemDrawerState } from "./ItemDrawerState";
import { ItemDetailsState } from "./ItemDetailsState";
import { RoomDrawerState } from "./RoomDrawerState";

type ItemSortKey = "name" | "source" | "quantity" | "unitPrice" | "total" | "status";

function getItemSortValue(item: Item, key: ItemSortKey): string | number {
  switch (key) {
    case "name":
      return item.name;
    case "source":
      return item.source;
    case "quantity":
      return item.quantity;
    case "unitPrice":
      return item.unitPrice;
    case "total":
      return itemTotal(item);
    case "status":
      return item.status;
  }
}

/** Filtrare text simplă (nume + sursă), diacritice-insensibilă, case-insensitive. */
function matchesSearch(item: Item, query: string): boolean {
  if (!query.trim()) return true;
  const normalize = (s: string) =>
    s
      .toLocaleLowerCase("ro")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  const q = normalize(query);
  return normalize(item.name).includes(q) || normalize(item.source).includes(q);
}

export default function ElementePage() {
  const { project, rooms, items, summary, comparisonGroups, addItem, deleteItem, deleteRoom } = useStore();
  const money = (value: number) => formatMoney(value, project.currency);

  const [itemDrawer, setItemDrawer] = useState<ItemDrawerState>({ open: false });
  const [itemDetails, setItemDetails] = useState<ItemDetailsState>({ open: false });
  const [roomDrawer, setRoomDrawer] = useState<RoomDrawerState>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  /** Închide voletul de detalii și deschide formularul de editare pentru același element. */
  function editFromDetails() {
    const item = itemDetails.item;
    setItemDetails({ open: false });
    if (item) setItemDrawer({ open: true, item });
  }

  // Căutare (bara din PageHeader) + sortare de coloană — un singur state de sortare, aplicat identic
  // pe fiecare tabel de cameră (fiecare cameră are propriul <table>, dar headerele sunt identice).
  const [search, setSearch] = useState("");
  const { sorted: sortedItems, sortKey, direction, toggleSort } = useSortableTable<Item, ItemSortKey>(
    items,
    getItemSortValue
  );
  const visibleItems = sortedItems.filter((item) => matchesSearch(item, search));

  // Quick add
  const [qaName, setQaName] = useState("");
  const [qaRoom, setQaRoom] = useState(rooms[0]?.id ?? "");
  const [qaPrice, setQaPrice] = useState("");
  // Poză făcută cu camera telefonului — stocată ca data URL (base64), nu există upload/backend real încă.
  const [qaImage, setQaImage] = useState<string | undefined>(undefined);

  function handleQaPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setQaImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  // Mobil — vezi „Confirmare Ștergere - Bottom Sheet Mobile" (acoperă întreg ecranul „Elemente de Cumpărat" mobil)
  const [mobileQuickAddOpen, setMobileQuickAddOpen] = useState(false);
  const [mobileFilterRoomId, setMobileFilterRoomId] = useState<string | null>(null);
  const [mobileOpenRooms, setMobileOpenRooms] = useState<Set<string>>(new Set());

  function toggleMobileRoom(roomId: string) {
    setMobileOpenRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  }

  // Totalurile de proiect vin din agregarea server-side (Problema 2 din audit); cele per cameră
  // (roomSpent, boughtCount(roomItems)) rămân client-side — randare de detaliu, nu agregat de dashboard.
  const { totalSpent: spent, boughtCount: bought, purchaseProgress: progress } = summary;

  // Un singur `pending` pentru butoanele de Adăugare Rapidă desktop + mobil — trimit ambele la același
  // handler și nu pot fi apăsate simultan (unul e `md:hidden`, celălalt `hidden md:flex`).
  const { run: quickAdd, pending: quickAddPending } = useAsyncAction(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaName || !qaRoom) return;
    await addItem({
      name: qaName,
      roomId: qaRoom,
      materialType: MaterialType.Altele,
      source: "",
      status: ItemStatus.InAsteptare,
      quantity: 1,
      unitPrice: Number(qaPrice) || 0,
      imageUrl: qaImage,
      origin: ItemOrigin.Manual,
    });
    setQaName("");
    setQaPrice("");
    setQaImage(undefined);
  });

  return (
    <div>
      <PageHeader
        title="Elemente de Cumpărat"
        searchPlaceholder="Caută elemente..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Sumar — card unic cu gradient închis, identic pe mobil și desktop. */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
        <DashboardSummaryCard
          metrics={[
            { label: "Buget total estimat", value: money(project.totalBudget) },
            {
              label: "Total cheltuit",
              value: money(spent),
              footer: (
                <SummaryProgressFooter
                  percent={project.totalBudget ? (spent / project.totalBudget) * 100 : 0}
                />
              ),
            },
            { label: "Elemente achiziționate", value: `${bought} din ${items.length}` },
            {
              // BIZ-2 (docs/tickete-audit-calcule-securitate.md): „buc." în etichetă disambiguează
              // explicit de eficiența bugetară (valorică, din /centralizator) — un element scump
              // necumpărat + o plintă ieftină cumpărată pot da 50% aici fără să însemne 50% din buget.
              label: "Progres achiziții (buc.)",
              value: `${progress}%`,
              footer: <SummaryProgressFooter percent={progress} color="secondary" />,
            },
          ]}
        />
      </div>

      {/* Desktop — vezi „Elemente de Cumpărat - Meniu Restrâns" */}
      <div className="mx-auto hidden max-w-7xl space-y-6 px-4 py-6 sm:px-6 md:block lg:px-10">
        <div className="flex items-center justify-between gap-3">
          {rooms.length > 1 && (
            <section className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setMobileFilterRoomId(null)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold transition-colors ${
                  mobileFilterRoomId === null
                    ? "bg-primary text-white"
                    : "border border-line bg-surface text-muted hover:bg-surface-low"
                }`}
              >
                Toate
              </button>
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setMobileFilterRoomId(room.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold transition-colors ${
                    mobileFilterRoomId === room.id
                      ? "bg-primary text-white"
                      : "border border-line bg-surface text-muted hover:bg-surface-low"
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </section>
          )}
          <button
            onClick={() => setRoomDrawer({ open: true })}
            className="ml-auto shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            + Adaugă Cameră
          </button>
        </div>

        {/* Adăugare rapidă — degrade soft (identic cu DashboardSummaryCard), nu negru plat. */}
        <form
          onSubmit={quickAdd}
          className="rounded-xl p-4 text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #000000 100%)" }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex shrink-0 items-center gap-3">
              <span className="material-symbols-outlined text-secondary">
                {ACTION_ICONS.quickAdd}
              </span>
              <h3 className="font-heading text-base font-bold">Adăugare Rapidă</h3>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-white/70">
                  Nume element
                </label>
                <input
                  value={qaName}
                  onChange={(e) => setQaName(e.target.value)}
                  placeholder="ex: Parchet stejar"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/40 outline-none transition-all focus:bg-white/20"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-white/70">
                  Cameră
                </label>
                <select
                  value={qaRoom}
                  onChange={(e) => setQaRoom(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white outline-none transition-all focus:bg-white/20"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id} className="bg-primary text-white">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-white/70">
                  Preț estimat (€)
                </label>
                <DecimalInput
                  value={qaPrice}
                  onChange={setQaPrice}
                  placeholder="0,00"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-mono text-sm text-white outline-none transition-all focus:bg-white/20"
                />
              </div>
            </div>
          </div>

          {/* Poză element + Salvează — un singur rând compact, fiecare element cu lățimea lui
              naturală (nu întins pe tot spațiul disponibil ca înainte). */}
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3">
              <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-white/70">
                Poză element
              </span>
              {qaImage ? (
                <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qaImage} alt="Poză element" className="h-10 w-10 rounded object-cover" />
                  <button
                    type="button"
                    onClick={() => setQaImage(undefined)}
                    className="flex items-center gap-1 text-[11px] font-bold text-tertiary"
                  >
                    <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.delete}</span>
                    Elimină
                  </button>
                </div>
              ) : (
                <label className="flex h-10 w-fit cursor-pointer items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 text-[12px] font-bold text-white transition-colors hover:border-white/40 hover:bg-white/20">
                  <span className="material-symbols-outlined icon-btn">
                    {COMPARATOR_ICONS.addPhoto}
                  </span>
                  Fă o poză
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleQaPhoto}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Salvează — mereu ultimul buton din formular. */}
            <button
              type="submit"
              disabled={quickAddPending}
              aria-busy={quickAddPending}
              className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {quickAddPending ? (
                <Spinner />
              ) : (
                <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.save}</span>
              )}
              Salvează
            </button>
          </div>
        </form>

        {/* Camere */}
        <div className="space-y-6">
          {rooms.length === 0 && (
            <EmptyState
              icon={TECHNICAL_ICONS.addRoomEmpty}
              title="Nicio cameră adăugată încă"
              description="Adaugă prima cameră ca să începi să urmărești elementele de cumpărat și bugetul lor."
              actionLabel="+ Adaugă Cameră"
              onAction={() => setRoomDrawer({ open: true })}
            />
          )}
          {rooms
            .filter((room) => !mobileFilterRoomId || room.id === mobileFilterRoomId)
            .map((room) => {
            const allRoomItems = itemsForRoom(items, room.id);
            const roomItems = itemsForRoom(visibleItems, room.id);
            const spentInRoom = roomSpent(items, room.id);
            return (
              <section
                key={room.id}
                className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
              >
                <div className="overflow-x-auto border-b border-line bg-surface">
                  <div className="flex min-w-max items-center justify-between gap-4 whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        {ROOM_TYPE_ICONS[room.type]}
                      </span>
                      <h2 className="font-heading text-sm font-bold">{room.name}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden flex-col items-end sm:flex">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-muted">
                          Buget utilizat
                        </span>
                        <span className="font-mono text-xs text-primary">
                          {money(spentInRoom)} / {money(room.allocatedBudget)}
                        </span>
                      </div>
                      <button
                        onClick={() => setRoomDrawer({ open: true, room })}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-low hover:text-primary"
                        aria-label={`Editează camera ${room.name}`}
                      >
                        <span className="material-symbols-outlined icon-btn">
                          {ACTION_ICONS.editItem}
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget({ kind: "room", id: room.id, name: room.name })
                        }
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-low hover:text-tertiary"
                        aria-label={`Șterge camera ${room.name}`}
                      >
                        <span className="material-symbols-outlined icon-btn">
                          {ACTION_ICONS.delete}
                        </span>
                      </button>
                      <button
                        onClick={() => setItemDrawer({ open: true, roomId: room.id })}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90"
                      >
                        Adaugă
                      </button>
                    </div>
                  </div>
                </div>

                {allRoomItems.length === 0 ? (
                  <p className="px-6 py-6 text-sm text-muted">
                    Niciun element încă. Adaugă primul element pentru această cameră.
                  </p>
                ) : roomItems.length === 0 ? (
                  <p className="px-6 py-6 text-sm text-muted">
                    {`Niciun element nu corespunde căutării „${search}" în această cameră.`}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-line bg-surface-low/30">
                        <tr className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          <SortableTh
                            label="Element"
                            sortKey="name"
                            activeKey={sortKey}
                            direction={direction}
                            onSort={toggleSort}
                            className="px-6"
                          />
                          <SortableTh
                            label="Sursă"
                            sortKey="source"
                            activeKey={sortKey}
                            direction={direction}
                            onSort={toggleSort}
                          />
                          <SortableTh
                            label="Cant."
                            sortKey="quantity"
                            activeKey={sortKey}
                            direction={direction}
                            onSort={toggleSort}
                            align="right"
                          />
                          <SortableTh
                            label="Preț unit"
                            sortKey="unitPrice"
                            activeKey={sortKey}
                            direction={direction}
                            onSort={toggleSort}
                            align="right"
                          />
                          <SortableTh
                            label="Total"
                            sortKey="total"
                            activeKey={sortKey}
                            direction={direction}
                            onSort={toggleSort}
                            align="right"
                          />
                          <SortableTh
                            label="Status"
                            sortKey="status"
                            activeKey={sortKey}
                            direction={direction}
                            onSort={toggleSort}
                          />
                          <th className="px-3 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {roomItems.map((item) => (
                          <tr
                            key={item.id}
                            className={`transition-colors hover:bg-surface-low/40 ${
                              item.origin === ItemOrigin.Configurare
                                ? "bg-secondary/5 border-l-2 border-l-secondary"
                                : ""
                            }`}
                          >
                            <td className="whitespace-nowrap px-6 py-3">
                              <div className="flex items-center gap-3">
                                {item.imageUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-8 w-8 shrink-0 rounded border border-line object-cover"
                                  />
                                )}
                                <span className="font-medium text-primary">{item.name}</span>
                                <OriginBadge origin={item.origin} />
                                {(() => {
                                  const decidedGroup = decidedGroupForItem(comparisonGroups, item.id);
                                  return decidedGroup ? (
                                    <Link
                                      href={`/comparator/${decidedGroup.id}`}
                                      title="Prețul acestui element vine dintr-o ofertă aleasă în Comparator"
                                      className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700 hover:bg-violet-200"
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: 10 }}>
                                        {COMPARATOR_ICONS.chosen}
                                      </span>
                                      Ofertă aleasă
                                    </Link>
                                  ) : null;
                                })()}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-muted">
                              {item.source}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-right font-mono">
                              {item.quantity} <span className="text-[10px] text-muted">{materialUnit(item.materialType)}</span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-right font-mono">
                              {item.unitPrice === 0 ? (
                                <span
                                  className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-tertiary"
                                  title="Element generat automat din configurare — completează prețul ca să contribuie la totaluri"
                                >
                                  Fără preț
                                </span>
                              ) : (
                                money(item.unitPrice)
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-right font-mono font-semibold text-primary">
                              {money(itemTotal(item))}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3">
                              <StatusChip status={item.status} size="sm" />
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setItemDetails({ open: true, item })}
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-low hover:text-secondary"
                                  aria-label={`Vezi detalii ${item.name}`}
                                >
                                  <span className="material-symbols-outlined icon-btn">
                                    {ACTION_ICONS.viewDetails}
                                  </span>
                                </button>
                                <button
                                  onClick={() => setItemDrawer({ open: true, item })}
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-low hover:text-primary"
                                  aria-label={`Editează ${item.name}`}
                                >
                                  <span className="material-symbols-outlined icon-btn">
                                    {ACTION_ICONS.editInline}
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      kind: "item",
                                      id: item.id,
                                      name: item.name,
                                    })
                                  }
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-low hover:text-tertiary"
                                  aria-label={`Șterge ${item.name}`}
                                >
                                  <span className="material-symbols-outlined icon-btn">
                                    {ACTION_ICONS.delete}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* Mobil — vezi „Confirmare Ștergere - Bottom Sheet Mobile" (dialogul e ConfirmDialog, deja bottom-sheet pe mobil) */}
      <div className="space-y-6 px-4 py-4 md:hidden">
        {/* Filtre cameră */}
        <section className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            onClick={() => setMobileFilterRoomId(null)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold transition-colors ${
              mobileFilterRoomId === null
                ? "bg-primary text-white"
                : "border border-line bg-surface text-muted hover:bg-surface-low"
            }`}
          >
            Toate
          </button>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setMobileFilterRoomId(room.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold transition-colors ${
                mobileFilterRoomId === room.id
                  ? "bg-primary text-white"
                  : "border border-line bg-surface text-muted hover:bg-surface-low"
              }`}
            >
              {room.name}
            </button>
          ))}
        </section>

        {/* Adăugare rapidă — acordeon */}
        <section className="overflow-hidden rounded-xl border border-line bg-surface-low">
          <button
            type="button"
            onClick={() => setMobileQuickAddOpen((v) => !v)}
            className="flex w-full items-center justify-between border-b border-line bg-white px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-foreground">
                {ACTION_ICONS.quickAdd}
              </span>
              <span className="text-[12px] font-bold uppercase text-foreground">
                Adăugare Rapidă
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-foreground transition-transform duration-300 ${mobileQuickAddOpen ? "rotate-180" : ""}`}
            >
              {ACTION_ICONS.expandMore}
            </span>
          </button>
          {mobileQuickAddOpen && (
            <form
              onSubmit={async (e) => {
                await quickAdd(e);
                setMobileQuickAddOpen(false);
              }}
              className="space-y-3 bg-white px-4 py-4"
            >
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-muted">
                  Nume element
                </label>
                <input
                  value={qaName}
                  onChange={(e) => setQaName(e.target.value)}
                  placeholder="ex: Baterie lavoar"
                  className="w-full rounded border border-line bg-surface-low p-3 text-sm outline-none focus:border-secondary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase text-muted">
                    Cameră
                  </label>
                  <select
                    value={qaRoom}
                    onChange={(e) => setQaRoom(e.target.value)}
                    className="w-full appearance-none rounded border border-line bg-surface-low p-3 text-sm outline-none focus:border-secondary"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase text-muted">
                    Preț estimat
                  </label>
                  <DecimalInput
                    value={qaPrice}
                    onChange={setQaPrice}
                    placeholder="0,00"
                    className="w-full rounded border border-line bg-surface-low p-3 font-mono text-sm outline-none focus:border-secondary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-muted">
                  Poză element
                </label>
                {qaImage ? (
                  <div className="flex items-center gap-3 rounded border border-line bg-surface-low p-2">
                    <img
                      src={qaImage}
                      alt="Poză element"
                      className="h-14 w-14 rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setQaImage(undefined)}
                      className="ml-auto flex items-center gap-1 text-[11px] font-bold text-tertiary"
                    >
                      <span className="material-symbols-outlined icon-btn">
                        {ACTION_ICONS.delete}
                      </span>
                      Elimină
                    </button>
                  </div>
                ) : (
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-line bg-surface-low p-3 text-[12px] font-bold text-muted active:scale-[0.98]">
                    <span className="material-symbols-outlined">{COMPARATOR_ICONS.addPhoto}</span>
                    Fă o poză
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleQaPhoto}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <button
                type="submit"
                disabled={quickAddPending}
                aria-busy={quickAddPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-4 text-[12px] font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {quickAddPending && <Spinner />}
                Salvează Articol
              </button>
            </form>
          )}
        </section>

        <button
          type="button"
          onClick={() => setRoomDrawer({ open: true })}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          + Adaugă Cameră
        </button>

        {/* Camere — acordeon */}
        <div className="space-y-3">
          {rooms.length === 0 && (
            <EmptyState
              icon={TECHNICAL_ICONS.addRoomEmpty}
              title="Nicio cameră adăugată încă"
              description="Adaugă prima cameră ca să începi să urmărești elementele de cumpărat."
              actionLabel="+ Adaugă Cameră"
              onAction={() => setRoomDrawer({ open: true })}
            />
          )}
          {rooms
            .filter((room) => !mobileFilterRoomId || room.id === mobileFilterRoomId)
            .map((room) => {
              const roomItems = itemsForRoom(items, room.id);
              const roomBought = boughtCount(roomItems);
              const roomTotal = roomItems.reduce((s, i) => s + itemTotal(i), 0);
              const isOpen = mobileOpenRooms.has(room.id);

              return (
                <div
                  key={room.id}
                  className="overflow-hidden rounded-xl border border-line bg-surface"
                >
                  <button
                    type="button"
                    onClick={() => toggleMobileRoom(room.id)}
                    className="flex w-full items-center justify-between px-4 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">
                        {ROOM_TYPE_ICONS[room.type]}
                      </span>
                      <div>
                        <h3 className="font-heading text-[15px] font-bold text-foreground">
                          {room.name}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                          {roomBought} din {roomItems.length} cumpărate
                        </p>
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-secondary">
                          Total: {money(roomTotal)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemDrawer({ open: true, roomId: room.id });
                          }}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-low hover:text-primary"
                          aria-label={`Adaugă element în ${room.name}`}
                        >
                          <span className="material-symbols-outlined icon-btn">
                            {ACTION_ICONS.add}
                          </span>
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRoomDrawer({ open: true, room });
                          }}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-low hover:text-primary"
                          aria-label={`Editează camera ${room.name}`}
                        >
                          <span className="material-symbols-outlined icon-btn">
                            {ACTION_ICONS.editItem}
                          </span>
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ kind: "room", id: room.id, name: room.name });
                          }}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-tertiary/70 hover:bg-surface-low hover:text-tertiary"
                          aria-label={`Șterge camera ${room.name}`}
                        >
                          <span className="material-symbols-outlined icon-btn">
                            {ACTION_ICONS.delete}
                          </span>
                        </span>
                      </div>
                      <span
                        className={`material-symbols-outlined icon-btn text-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      >
                        {ACTION_ICONS.expandMore}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-line border-t border-line/30">
                      {roomItems.length === 0 ? (
                        <p className="px-4 py-4 text-sm text-muted">
                          Niciun element încă în această cameră.
                        </p>
                      ) : (
                        roomItems.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between px-4 py-4 ${
                              item.origin === ItemOrigin.Configurare
                                ? "bg-secondary/5 border-l-2 border-l-secondary"
                                : ""
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {item.imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-10 w-10 shrink-0 rounded border border-line object-cover"
                                />
                              )}
                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="truncate font-heading text-[15px] font-bold text-foreground">
                                    {item.name}
                                  </h4>
                                  <OriginBadge origin={item.origin} />
                                  {(() => {
                                    const decidedGroup = decidedGroupForItem(comparisonGroups, item.id);
                                    return decidedGroup ? (
                                      <Link
                                        href={`/comparator/${decidedGroup.id}`}
                                        title="Prețul acestui element vine dintr-o ofertă aleasă în Comparator"
                                        className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700 hover:bg-violet-200"
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: 10 }}>
                                          {COMPARATOR_ICONS.chosen}
                                        </span>
                                        Ofertă aleasă
                                      </Link>
                                    ) : null;
                                  })()}
                                </div>
                                <p className="font-mono text-sm text-muted">
                                  {item.unitPrice === 0 ? (
                                    <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-tertiary">
                                      Fără preț
                                    </span>
                                  ) : (
                                    money(item.unitPrice)
                                  )}
                                </p>
                              </div>
                            </div>
                            <ItemRowMenu
                              itemName={item.name}
                              onView={() => setItemDetails({ open: true, item })}
                              onEdit={() => setItemDrawer({ open: true, item })}
                              onDelete={() =>
                                setDeleteTarget({ kind: "item", id: item.id, name: item.name })
                              }
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <ItemFormDrawer
        open={itemDrawer.open}
        onClose={() => setItemDrawer({ open: false })}
        roomId={itemDrawer.roomId}
        item={itemDrawer.item}
      />
      <ItemDetailsDrawer
        open={itemDetails.open}
        item={itemDetails.item}
        onClose={() => setItemDetails({ open: false })}
        onEdit={editFromDetails}
      />
      <RoomFormDrawer open={roomDrawer.open} onClose={() => setRoomDrawer({ open: false })} room={roomDrawer.room} />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Confirmare ștergere"
        message={
          deleteTarget?.kind === "room"
            ? `Sigur ștergi camera „${deleteTarget?.name}" și toate elementele ei?`
            : `Sigur ștergi elementul „${deleteTarget?.name}"?`
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          if (deleteTarget.kind === "room") await deleteRoom(deleteTarget.id);
          else await deleteItem(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
