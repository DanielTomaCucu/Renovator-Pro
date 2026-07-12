"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/shared/store";
import {
  budgetEfficiency,
  formatMoney,
  itemTotal,
  itemsForRoom,
  roomSubtotal,
  totalEstimated,
  totalSpent,
} from "@/shared/functions";
import { ItemStatus, MaterialType } from "@/shared/types";
import {
  ACTION_ICONS,
  CENTRALIZATOR_ICONS,
  DOCUMENT_ICONS,
  ROOM_TYPE_ICONS,
  STATUS_ICONS,
} from "@/shared/icons";

/** Culoare de fundal/text a badge-ului „Tip” per categorie de material — vezi design Stitch. */
const MATERIAL_BADGE_STYLES: Record<MaterialType, string> = {
  [MaterialType.Gresie]: "bg-emerald-50 text-emerald-700",
  [MaterialType.Faianta]: "bg-emerald-50 text-emerald-700",
  [MaterialType.Parchet]: "bg-tertiary/10 text-tertiary",
  [MaterialType.Vopsea]: "bg-surface-low text-muted",
  [MaterialType.Sanitare]: "bg-secondary/10 text-secondary",
  [MaterialType.Mobila]: "bg-secondary/10 text-secondary",
  [MaterialType.Electrocasnice]: "bg-secondary/10 text-secondary",
  [MaterialType.CorpuriIluminat]: "bg-secondary/10 text-secondary",
  [MaterialType.Altele]: "bg-surface-low text-muted",
};

const STATUS_DOT: Record<ItemStatus, { icon: string; className: string }> = {
  [ItemStatus.Cumparat]: { icon: STATUS_ICONS[ItemStatus.Cumparat], className: "text-emerald-600" },
  [ItemStatus.Planificat]: {
    icon: CENTRALIZATOR_ICONS.statusInAsteptare,
    className: "text-amber-500",
  },
  [ItemStatus.InAsteptare]: {
    icon: CENTRALIZATOR_ICONS.statusInAsteptare,
    className: "text-amber-500",
  },
};

export default function CentralizatorPage() {
  const { rooms, items } = useStore();
  const [showSubtotals, setShowSubtotals] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const estimated = useMemo(() => totalEstimated(items), [items]);
  const spent = useMemo(() => totalSpent(items), [items]);
  const efficiency = budgetEfficiency(estimated, spent);

  function toggleRoom(roomId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  }

  const donutOffset = 100 - efficiency;

  return (
    <div>
      <PageHeader title="Centralizator Costuri" searchPlaceholder="Caută element sau lucrare..." />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-10">
        {/* Sumar */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 shadow-sm sm:p-8">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  {CENTRALIZATOR_ICONS.totalEstimat}
                </span>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                  Total Estimat Proiect
                </p>
              </div>
              <span className="font-mono text-[32px] font-extrabold leading-none tracking-tight text-primary">
                {formatMoney(estimated)}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary/20" />
                <span className="text-[10px] uppercase tracking-wider text-muted">
                  Buget de Referință
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-6 shadow-sm sm:p-8">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-secondary" />
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  {CENTRALIZATOR_ICONS.totalCheltuit}
                </span>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted">
                  Total Cheltuit la Zi
                </p>
              </div>
              <span className="font-mono text-[32px] font-extrabold leading-none tracking-tight text-secondary">
                {formatMoney(spent)}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-secondary/20" />
                <span className="text-[10px] uppercase tracking-wider text-muted">
                  {efficiency}% din total estimat
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-primary/10 bg-surface-low p-6 shadow-sm sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    {CENTRALIZATOR_ICONS.eficientaBugetara}
                  </span>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary/60">
                    Eficiență Bugetară
                  </p>
                </div>
                <span className="font-mono text-[32px] font-extrabold leading-none tracking-tight text-primary">
                  {efficiency}%
                </span>
                <p className="text-[10px] uppercase tracking-wider text-muted">
                  Calculat în timp real
                </p>
              </div>
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    className="stroke-primary/10"
                    cx="18"
                    cy="18"
                    fill="none"
                    r="16"
                    strokeWidth="3"
                  />
                  <circle
                    className="stroke-primary"
                    cx="18"
                    cy="18"
                    fill="none"
                    r="16"
                    strokeDasharray="100"
                    strokeDashoffset={donutOffset}
                    strokeLinecap="round"
                    strokeWidth="3"
                    pathLength={100}
                  />
                </svg>
                <span className="material-symbols-outlined absolute text-[24px] text-primary/40">
                  {CENTRALIZATOR_ICONS.eficientaBugetaraBadge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-line bg-surface-low px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-primary/80">
                {CENTRALIZATOR_ICONS.tabelDetaliat}
              </span>
              <h3 className="font-heading text-[16px] tracking-tight text-primary">
                Tabel Detaliat Proiect
              </h3>
            </div>
            <div className="flex items-center gap-8">
              <label className="flex select-none items-center gap-2 text-sm font-medium text-muted">
                <input
                  type="checkbox"
                  checked={showSubtotals}
                  onChange={(e) => setShowSubtotals(e.target.checked)}
                  className="h-4 w-4 rounded border-line text-primary focus:ring-primary/20"
                />
                Afișează Subtotaluri
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-line bg-surface-low/30">
                <tr>
                  <th className="whitespace-nowrap px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span className="inline-flex items-center gap-1">
                      Element / Tip Lucrare
                      <span className="material-symbols-outlined text-[14px] opacity-40">
                        {ACTION_ICONS.sortIndicator}
                      </span>
                    </span>
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span className="inline-flex items-center gap-1">
                      Tip
                      <span className="material-symbols-outlined text-[14px] opacity-40">
                        {ACTION_ICONS.sortIndicator}
                      </span>
                    </span>
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span className="inline-flex items-center gap-1">
                      Sursă
                      <span className="material-symbols-outlined text-[14px] opacity-40">
                        {ACTION_ICONS.sortIndicator}
                      </span>
                    </span>
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span className="inline-flex items-center gap-1">
                      Cant.
                      <span className="material-symbols-outlined text-[14px] opacity-40">
                        {ACTION_ICONS.sortIndicator}
                      </span>
                    </span>
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span className="inline-flex items-center gap-1">
                      Preț Unitar
                      <span className="material-symbols-outlined text-[14px] opacity-40">
                        {ACTION_ICONS.sortIndicator}
                      </span>
                    </span>
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span className="inline-flex items-center gap-1">
                      Total
                      <span className="material-symbols-outlined text-[14px] opacity-40">
                        {ACTION_ICONS.sortIndicator}
                      </span>
                    </span>
                  </th>
                  <th className="w-24 whitespace-nowrap px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted">
                    <span className="inline-flex items-center gap-1">
                      Status
                      <span className="material-symbols-outlined text-[14px] opacity-40">
                        {ACTION_ICONS.sortIndicator}
                      </span>
                    </span>
                  </th>
                </tr>
              </thead>

              {rooms.map((room) => {
                const roomItems = itemsForRoom(items, room.id);
                const subtotal = roomSubtotal(items, room.id);
                if (roomItems.length === 0) return null;
                const isCollapsed = collapsed.has(room.id);

                return (
                  <tbody key={room.id}>
                    <tr
                      onClick={() => toggleRoom(room.id)}
                      className="cursor-pointer select-none border-y border-t-2 border-line bg-surface-low/40"
                    >
                      <td className="px-4 py-3" colSpan={7}>
                        <div className="flex items-center gap-3">
                          <span
                            className={`material-symbols-outlined text-muted transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                          >
                            {ACTION_ICONS.expandMore}
                          </span>
                          <span className="material-symbols-outlined text-[18px] text-secondary">
                            {ROOM_TYPE_ICONS[room.type]}
                          </span>
                          <span className="font-heading text-[14px] font-bold uppercase tracking-wide text-primary">
                            {room.name}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {!isCollapsed &&
                      roomItems.map((item) => {
                        const status = STATUS_DOT[item.status];
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-line/50 transition-colors hover:bg-background"
                          >
                            <td className="px-4 py-3 text-[13px] text-foreground">{item.name}</td>
                            <td className="px-4 py-3 text-[13px]">
                              <span
                                className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-wider ${MATERIAL_BADGE_STYLES[item.materialType]}`}
                              >
                                {item.materialType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[13px] text-muted">{item.source}</td>
                            <td className="px-4 py-3 text-right font-mono text-[13px] text-muted">
                              {item.quantity}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[13px]">
                              {formatMoney(item.unitPrice)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[13px] font-medium">
                              {formatMoney(itemTotal(item))}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center">
                                <span
                                  className={`material-symbols-outlined ${status.className}`}
                                >
                                  {status.icon}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {showSubtotals && !isCollapsed && (
                      <tr className="border-t border-line bg-surface-low/20">
                        <td className="px-4 py-2.5" colSpan={7}>
                          <div className="flex items-center justify-end gap-4">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
                              Subtotal {room.name}
                            </span>
                            <span className="font-mono font-bold text-primary">
                              {formatMoney(subtotal)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}

              <tfoot>
                <tr className="bg-primary text-white">
                  <td className="px-6 py-8 text-right sm:px-8" colSpan={5}>
                    <div className="flex flex-col items-end">
                      <span className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                        Rezumat Financiar
                      </span>
                      <span className="font-heading text-[18px] font-bold text-white">
                        TOTAL GENERAL ESTIMAT
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-8 text-right sm:px-8" colSpan={2}>
                    <span className="font-mono text-[32px] font-extrabold tracking-tight">
                      {formatMoney(estimated)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Acțiuni */}
        <div className="flex flex-col items-center justify-between gap-6 rounded-xl border border-line bg-surface p-6 shadow-sm sm:p-8 md:flex-row">
          <div className="flex w-full gap-4 md:w-auto">
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line px-6 py-3 text-sm font-medium transition-all hover:bg-surface-low md:flex-none"
            >
              <span className="material-symbols-outlined text-[20px] opacity-60">
                {DOCUMENT_ICONS.print}
              </span>
              Imprimă Raport
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line px-6 py-3 text-sm font-medium transition-all hover:bg-surface-low md:flex-none">
              <span className="material-symbols-outlined text-[20px] opacity-60">
                {DOCUMENT_ICONS.share}
              </span>
              Partajează Detalii
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
