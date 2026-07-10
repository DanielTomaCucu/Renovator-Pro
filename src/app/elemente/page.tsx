"use client";

import { useMemo, useState } from "react";
import StatCard from "@/components/StatCard";
import StatusChip from "@/components/StatusChip";
import ItemFormDrawer from "@/components/ItemFormDrawer";
import RoomFormDrawer from "@/components/RoomFormDrawer";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatMoney, itemTotal, useStore } from "@/lib/store";
import { Item } from "@/lib/types";

export default function ElementePage() {
  const { project, rooms, items, addItem, deleteItem, deleteRoom } = useStore();

  const [itemDrawer, setItemDrawer] = useState<{
    open: boolean;
    roomId?: string;
    item?: Item | null;
  }>({ open: false });
  const [roomDrawerOpen, setRoomDrawerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<
    { kind: "item" | "room"; id: string; name: string } | null
  >(null);

  // Quick add
  const [qaName, setQaName] = useState("");
  const [qaRoom, setQaRoom] = useState(rooms[0]?.id ?? "");
  const [qaPrice, setQaPrice] = useState("");

  const spent = useMemo(
    () =>
      items
        .filter((i) => i.status === "Cumpărat")
        .reduce((s, i) => s + itemTotal(i), 0),
    [items]
  );
  const bought = items.filter((i) => i.status === "Cumpărat").length;
  const progress = items.length ? Math.round((bought / items.length) * 100) : 0;

  function quickAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!qaName || !qaRoom) return;
    addItem({
      name: qaName,
      roomId: qaRoom,
      materialType: "Altele",
      source: "",
      status: "În așteptare",
      quantity: 1,
      unitPrice: Number(qaPrice) || 0,
    });
    setQaName("");
    setQaPrice("");
  }

  return (
    <div className="px-6 py-6 lg:px-10 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">
          Elemente de Cumpărat
        </h1>
        <button
          onClick={() => setRoomDrawerOpen(true)}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          + Adaugă Cameră
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Buget total estimat"
          value={formatMoney(project.totalBudget)}
        />
        <StatCard
          label="Total cheltuit"
          value={formatMoney(spent)}
          accent="secondary"
        />
        <StatCard
          label="Elemente achiziționate"
          value={`${bought} din ${items.length}`}
        />
        <StatCard label="Progres achiziții" value={`${progress}%`} />
      </div>

      {/* Adăugare rapidă */}
      <form
        onSubmit={quickAdd}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-lg bg-primary p-4"
      >
        <span className="text-sm font-semibold text-white">
          ⚡ Adăugare Rapidă
        </span>
        <div className="flex-1 min-w-40">
          <label className="mb-1 block text-[10px] font-bold uppercase text-white/60">
            Nume element
          </label>
          <input
            value={qaName}
            onChange={(e) => setQaName(e.target.value)}
            placeholder="ex: Parchet stejar"
            className="w-full rounded-md px-3 py-2 text-sm bg-white outline-none"
          />
        </div>
        <div className="min-w-36">
          <label className="mb-1 block text-[10px] font-bold uppercase text-white/60">
            Cameră
          </label>
          <select
            value={qaRoom}
            onChange={(e) => setQaRoom(e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm bg-white outline-none"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="mb-1 block text-[10px] font-bold uppercase text-white/60">
            Preț estimat (€)
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={qaPrice}
            onChange={(e) => setQaPrice(e.target.value)}
            placeholder="0,00"
            className="w-full rounded-md px-3 py-2 text-sm bg-white outline-none font-mono"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-secondary px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Salvează
        </button>
      </form>

      {/* Camere */}
      <div className="mt-8 space-y-6">
        {rooms.map((room) => {
          const roomItems = items.filter((i) => i.roomId === room.id);
          const roomSpent = roomItems
            .filter((i) => i.status === "Cumpărat")
            .reduce((s, i) => s + itemTotal(i), 0);
          return (
            <section
              key={room.id}
              className="rounded-lg border border-line bg-surface"
            >
              <header className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="font-heading text-lg font-semibold">
                  {room.name}
                </h2>
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted">
                    <span className="text-[10px] font-bold uppercase block text-right">
                      Buget utilizat
                    </span>
                    <span className="font-mono">
                      {formatMoney(roomSpent)} /{" "}
                      {formatMoney(room.allocatedBudget)}
                    </span>
                  </p>
                  <button
                    onClick={() =>
                      setItemDrawer({ open: true, roomId: room.id })
                    }
                    className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90"
                  >
                    Adaugă
                  </button>
                  <button
                    onClick={() =>
                      setDeleteTarget({
                        kind: "room",
                        id: room.id,
                        name: room.name,
                      })
                    }
                    className="rounded p-2 text-muted hover:text-red-600"
                    aria-label={`Șterge camera ${room.name}`}
                  >
                    🗑
                  </button>
                </div>
              </header>

              {roomItems.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted">
                  Niciun element încă. Adaugă primul element pentru această
                  cameră.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                      <th className="px-5 py-3">Element</th>
                      <th className="px-3 py-3">Sursă</th>
                      <th className="px-3 py-3 text-right">Buc</th>
                      <th className="px-3 py-3 text-right">Preț unit</th>
                      <th className="px-3 py-3 text-right">Total</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {roomItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-line hover:bg-surface-low/50"
                      >
                        <td className="px-5 py-3 font-medium">{item.name}</td>
                        <td className="px-3 py-3 text-muted">{item.source}</td>
                        <td className="px-3 py-3 text-right font-mono">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-3 text-right font-mono">
                          {formatMoney(item.unitPrice)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-semibold">
                          {formatMoney(itemTotal(item))}
                        </td>
                        <td className="px-3 py-3">
                          <StatusChip status={item.status} />
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setItemDrawer({ open: true, item })}
                            className="rounded p-1.5 text-muted hover:text-foreground"
                            aria-label={`Editează ${item.name}`}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                kind: "item",
                                id: item.id,
                                name: item.name,
                              })
                            }
                            className="rounded p-1.5 text-muted hover:text-red-600"
                            aria-label={`Șterge ${item.name}`}
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          );
        })}
      </div>

      <ItemFormDrawer
        open={itemDrawer.open}
        onClose={() => setItemDrawer({ open: false })}
        roomId={itemDrawer.roomId}
        item={itemDrawer.item}
      />
      <RoomFormDrawer
        open={roomDrawerOpen}
        onClose={() => setRoomDrawerOpen(false)}
      />
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
