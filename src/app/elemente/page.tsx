"use client";

import { useMemo, useState } from "react";
import StatusChip from "@/components/StatusChip";
import OriginBadge from "@/components/OriginBadge";
import DashboardSummaryCard, { SummaryProgressFooter } from "@/components/DashboardSummaryCard";
import ItemFormDrawer from "@/components/ItemFormDrawer";
import RoomFormDrawer from "@/components/RoomFormDrawer";
import ConfirmDialog from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/shared/store";
import {
  boughtCount,
  formatMoney,
  itemTotal,
  itemsForRoom,
  purchaseProgress,
  roomSpent,
  totalSpent,
} from "@/shared/functions";
import { ItemOrigin, ItemStatus, MaterialType } from "@/shared/types";
import { ACTION_ICONS, ROOM_TYPE_ICONS } from "@/shared/icons";
import { DeleteTarget } from "./DeleteTarget";
import { ItemDrawerState } from "./ItemDrawerState";

export default function ElementePage() {
  const { project, rooms, items, addItem, deleteItem, deleteRoom } = useStore();
  const money = (value: number) => formatMoney(value, project.currency);

  const [itemDrawer, setItemDrawer] = useState<ItemDrawerState>({ open: false });
  const [roomDrawerOpen, setRoomDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

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

  const spent = useMemo(() => totalSpent(items), [items]);
  const bought = boughtCount(items);
  const progress = purchaseProgress(items);

  function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!qaName || !qaRoom) return;
    addItem({
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
  }

  return (
    <div>
      <PageHeader title="Elemente de Cumpărat" searchPlaceholder="Caută elemente..." />

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
              label: "Progres achiziții",
              value: `${progress}%`,
              footer: <SummaryProgressFooter percent={progress} color="secondary" />,
            },
          ]}
        />
      </div>

      {/* Desktop — vezi „Elemente de Cumpărat - Meniu Restrâns" */}
      <div className="mx-auto hidden max-w-7xl space-y-6 px-4 py-6 sm:px-6 md:block lg:px-10">
        <div className="flex justify-end">
          <button
            onClick={() => setRoomDrawerOpen(true)}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            + Adaugă Cameră
          </button>
        </div>

        {/* Adăugare rapidă */}
        <form
          onSubmit={quickAdd}
          className="rounded-xl bg-primary p-4 text-white shadow-md"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex shrink-0 items-center gap-3">
              <span className="material-symbols-outlined text-secondary">
                {ACTION_ICONS.quickAdd}
              </span>
              <h3 className="font-heading text-base font-bold">Adăugare Rapidă</h3>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
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
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={qaPrice}
                  onChange={(e) => setQaPrice(e.target.value)}
                  placeholder="0,00"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-mono text-sm text-white outline-none transition-all focus:bg-white/20"
                />
              </div>
              <button
                type="submit"
                className="flex h-10 items-center justify-center gap-2 self-end rounded-lg bg-secondary px-6 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined icon-btn">
                  {ACTION_ICONS.save}
                </span>
                Salvează
              </button>
            </div>
          </div>

          {/* Poză element — aceeași funcționalitate ca pe mobil (capture cameră), disponibilă acum
              și pe tabletă/desktop, nu doar sub 768px. */}
          <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
            <label className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-white/70">
              Poză element
            </label>
            {qaImage ? (
              <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qaImage} alt="Poză element" className="h-12 w-12 rounded object-cover" />
                <button
                  type="button"
                  onClick={() => setQaImage(undefined)}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase text-tertiary"
                >
                  <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.delete}</span>
                  Elimină
                </button>
              </div>
            ) : (
              <label className="flex w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/30 bg-white/10 p-2.5 text-[12px] font-bold uppercase text-white/70 transition-colors hover:bg-white/20">
                <span className="material-symbols-outlined">{ACTION_ICONS.photoCamera}</span>
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
        </form>

        {/* Camere */}
        <div className="space-y-6">
          {rooms.map((room) => {
            const roomItems = itemsForRoom(items, room.id);
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
                        onClick={() =>
                          setDeleteTarget({ kind: "room", id: room.id, name: room.name })
                        }
                        className="rounded p-1 text-muted hover:text-tertiary"
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

                {roomItems.length === 0 ? (
                  <p className="px-6 py-6 text-sm text-muted">
                    Niciun element încă. Adaugă primul element pentru această cameră.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-line bg-surface-low/30">
                        <tr className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          <th className="whitespace-nowrap px-6 py-3">
                            <span className="inline-flex items-center gap-1">
                              Element
                              <span className="material-symbols-outlined text-[14px] opacity-50">
                                {ACTION_ICONS.sortIndicator}
                              </span>
                            </span>
                          </th>
                          <th className="whitespace-nowrap px-3 py-3">
                            <span className="inline-flex items-center gap-1">
                              Sursă
                              <span className="material-symbols-outlined text-[14px] opacity-50">
                                {ACTION_ICONS.sortIndicator}
                              </span>
                            </span>
                          </th>
                          <th className="whitespace-nowrap px-3 py-3 text-right">Buc</th>
                          <th className="whitespace-nowrap px-3 py-3 text-right">
                            Preț unit
                          </th>
                          <th className="whitespace-nowrap px-3 py-3 text-right">Total</th>
                          <th className="whitespace-nowrap px-3 py-3">Status</th>
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
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-muted">
                              {item.source}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-right font-mono">
                              {item.quantity}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-right font-mono">
                              {money(item.unitPrice)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-right font-mono font-semibold text-primary">
                              {money(itemTotal(item))}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3">
                              <StatusChip status={item.status} size="sm" />
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => setItemDrawer({ open: true, item })}
                                  className="text-muted transition-colors hover:text-primary"
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
                                  className="text-muted transition-colors hover:text-tertiary"
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
            className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
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
              className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
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
              onSubmit={(e) => {
                quickAdd(e);
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
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={qaPrice}
                    onChange={(e) => setQaPrice(e.target.value)}
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
                      className="ml-auto flex items-center gap-1 text-[11px] font-bold uppercase text-tertiary"
                    >
                      <span className="material-symbols-outlined icon-btn">
                        {ACTION_ICONS.delete}
                      </span>
                      Elimină
                    </button>
                  </div>
                ) : (
                  <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-line bg-surface-low p-3 text-[12px] font-bold uppercase text-muted active:scale-[0.98]">
                    <span className="material-symbols-outlined">{ACTION_ICONS.photoCamera}</span>
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
                className="w-full rounded-lg bg-primary py-4 text-[12px] font-bold uppercase tracking-widest text-white transition-transform active:scale-[0.98]"
              >
                Salvează Articol
              </button>
            </form>
          )}
        </section>

        {/* Camere — acordeon */}
        <div className="space-y-3">
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
                          className="p-1 text-muted hover:text-primary"
                          aria-label={`Adaugă element în ${room.name}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {ACTION_ICONS.add}
                          </span>
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ kind: "room", id: room.id, name: room.name });
                          }}
                          className="p-1 text-tertiary/70 hover:text-tertiary"
                          aria-label={`Șterge camera ${room.name}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {ACTION_ICONS.delete}
                          </span>
                        </span>
                      </div>
                      <span
                        className={`material-symbols-outlined text-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
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
                                </div>
                                <p className="font-mono text-sm text-muted">
                                  {money(item.unitPrice)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setItemDrawer({ open: true, item })}
                                className="p-1 text-muted transition-colors hover:text-primary active:scale-90"
                                aria-label={`Editează ${item.name}`}
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  {ACTION_ICONS.editInline}
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteTarget({ kind: "item", id: item.id, name: item.name })
                                }
                                className="p-1 text-tertiary/70 transition-colors hover:text-tertiary active:scale-90"
                                aria-label={`Șterge ${item.name}`}
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  {ACTION_ICONS.delete}
                                </span>
                              </button>
                            </div>
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

      {/* FAB „Adaugă Cameră" — doar pe mobil, vezi design Stitch (buton flotant jos-dreapta) */}
      <button
        type="button"
        onClick={() => setRoomDrawerOpen(true)}
        aria-label="Adaugă Cameră"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-transform active:scale-95 hover:scale-105 md:hidden"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
          {ACTION_ICONS.addRoom}
        </span>
      </button>

      <ItemFormDrawer
        open={itemDrawer.open}
        onClose={() => setItemDrawer({ open: false })}
        roomId={itemDrawer.roomId}
        item={itemDrawer.item}
      />
      <RoomFormDrawer open={roomDrawerOpen} onClose={() => setRoomDrawerOpen(false)} />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Confirmare ștergere"
        message={
          deleteTarget?.kind === "room"
            ? `Sigur ștergi camera „${deleteTarget?.name}" și toate elementele ei?`
            : `Sigur ștergi elementul „${deleteTarget?.name}"?`
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.kind === "room") deleteRoom(deleteTarget.id);
          else deleteItem(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
