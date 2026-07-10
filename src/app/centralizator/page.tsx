"use client";

import { useMemo } from "react";
import StatCard from "@/components/StatCard";
import StatusChip from "@/components/StatusChip";
import { formatMoney, itemTotal, useStore } from "@/lib/store";

export default function CentralizatorPage() {
  const { project, rooms, items } = useStore();

  const totalEstimated = useMemo(
    () => items.reduce((s, i) => s + itemTotal(i), 0),
    [items]
  );
  const spent = useMemo(
    () =>
      items
        .filter((i) => i.status === "Cumpărat")
        .reduce((s, i) => s + itemTotal(i), 0),
    [items]
  );
  const progress = items.length
    ? Math.round(
        (items.filter((i) => i.status === "Cumpărat").length / items.length) *
          100
      )
    : 0;

  return (
    <div className="px-6 py-6 lg:px-10 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">
          Centralizator Costuri
        </h1>
        <button
          onClick={() => window.print()}
          className="rounded-md border border-line bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-surface-low"
        >
          🖨 Imprimă Raport
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total estimat proiect"
          value={formatMoney(totalEstimated)}
        />
        <StatCard
          label="Total cheltuit la zi"
          value={formatMoney(spent)}
          accent="secondary"
        />
        <StatCard label="Eficiență bugetară" value={`${progress}%`} />
      </div>

      <div className="mt-8 space-y-6">
        {rooms.map((room) => {
          const roomItems = items.filter((i) => i.roomId === room.id);
          const subtotal = roomItems.reduce((s, i) => s + itemTotal(i), 0);
          if (roomItems.length === 0) return null;
          return (
            <section
              key={room.id}
              className="rounded-lg border border-line bg-surface overflow-hidden"
            >
              <header className="bg-surface-low px-5 py-3">
                <h2 className="font-heading text-sm font-bold uppercase tracking-wide">
                  {room.name}
                </h2>
              </header>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3">Element</th>
                    <th className="px-3 py-3">Tip</th>
                    <th className="px-3 py-3">Sursă</th>
                    <th className="px-3 py-3 text-right">Cant.</th>
                    <th className="px-3 py-3 text-right">Preț unitar</th>
                    <th className="px-3 py-3 text-right">Total</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roomItems.map((item) => (
                    <tr key={item.id} className="border-t border-line">
                      <td className="px-5 py-3 font-medium">{item.name}</td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-surface-low px-2 py-0.5 text-[11px] font-bold uppercase text-muted">
                          {item.materialType}
                        </span>
                      </td>
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
                    </tr>
                  ))}
                  <tr className="border-t border-line bg-surface-low/50">
                    <td
                      colSpan={5}
                      className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-muted"
                    >
                      Subtotal {room.name}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold">
                      {formatMoney(subtotal)}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </section>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between rounded-lg bg-primary px-6 py-5 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-white/60">
          Rezumat financiar — Total general estimat
        </p>
        <p className="font-mono text-2xl font-bold">
          {formatMoney(totalEstimated, project.currency)}
        </p>
      </div>
    </div>
  );
}
