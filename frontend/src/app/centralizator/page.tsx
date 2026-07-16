"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/shared/store";
import {
  budgetEfficiency,
  formatMoney,
  itemTotal,
  itemsForRoom,
  roomSubtotal,
} from "@/shared/functions";
import { ItemStatus, MaterialType } from "@/shared/types";
import {
  ACTION_ICONS,
  CENTRALIZATOR_ICONS,
  DOCUMENT_ICONS,
  ROOM_TYPE_ICONS,
  STATUS_ICONS,
} from "@/shared/icons";
import DashboardSummaryCard, {
  SummaryAccentFooter,
  SummaryProgressFooter,
} from "@/components/DashboardSummaryCard";

/** Culoare de fundal/text a badge-ului „Tip” per categorie de material — vezi design Stitch. */
const MATERIAL_BADGE_STYLES: Record<MaterialType, string> = {
  [MaterialType.Gresie]: "bg-emerald-50 text-emerald-700",
  [MaterialType.Faianta]: "bg-emerald-50 text-emerald-700",
  [MaterialType.Plinta]: "bg-emerald-50 text-emerald-700",
  [MaterialType.Parchet]: "bg-tertiary/10 text-tertiary",
  [MaterialType.Vopsea]: "bg-surface-low text-muted",
  [MaterialType.Tapet]: "bg-surface-low text-muted",
  [MaterialType.GlafFereastra]: "bg-surface-low text-muted",
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
  const { project, rooms, items, summary } = useStore();
  const money = (value: number) => formatMoney(value, project.currency);
  const [showSubtotals, setShowSubtotals] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Totalurile de proiect vin din agregarea server-side (Problema 2 din audit); subtotalul/itemii
  // per cameră rămân calculați client-side (randare de detaliu, nu agregat de dashboard).
  const { totalEstimated: estimated, totalSpent: spent } = summary;
  const efficiency = budgetEfficiency(estimated, spent);

  function toggleRoom(roomId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  }

  return (
    <div>
      <PageHeader title="Centralizator Costuri" searchPlaceholder="Caută element sau lucrare..." />

      {/* Sumar — card unic cu gradient închis, identic pe mobil și desktop. */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
        <DashboardSummaryCard
          metrics={[
            {
              label: "Total Estimat Proiect",
              value: money(estimated),
              footer: (
                <SummaryAccentFooter dotClassName="bg-emerald-400" textClassName="text-emerald-400">
                  Buget de referință
                </SummaryAccentFooter>
              ),
            },
            {
              label: "Total Cheltuit la Zi",
              value: money(spent),
              footer: <SummaryAccentFooter>{efficiency}% din total estimat</SummaryAccentFooter>,
            },
            {
              label: "Eficiență Bugetară",
              value: `${efficiency}%`,
              footer: <SummaryProgressFooter percent={efficiency} color="secondary" />,
            },
          ]}
        />
      </div>

      {/* Desktop — vezi „Tabel Centralizator - Meniu Restrâns Premium" */}
      <div className="mx-auto hidden max-w-7xl space-y-8 px-4 py-6 sm:px-6 md:block lg:px-10">
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
                              {money(item.unitPrice)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[13px] font-medium">
                              {money(itemTotal(item))}
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
                              {money(subtotal)}
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
                      {money(estimated)}
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

      {/* Mobil — vezi „Centralizator Costuri - Mobile Table View" (fără bottom nav, se face în Flutter) */}
      <div className="pb-24 md:hidden">
        <div className="px-4 py-4">
          {/* Secțiuni per cameră — acordeon cu tabel scrollabil orizontal */}
          <div className="mt-4 flex flex-col gap-6">
            {rooms.map((room) => {
              const roomItems = itemsForRoom(items, room.id);
              const subtotal = roomSubtotal(items, room.id);
              if (roomItems.length === 0) return null;
              const isCollapsed = collapsed.has(room.id);

              return (
                <section key={room.id} className="border-b border-line/50">
                  <button
                    type="button"
                    onClick={() => toggleRoom(room.id)}
                    className="flex w-full items-center justify-between rounded-r border-l-4 border-primary bg-surface-low py-2 pl-4 pr-2"
                  >
                    <h2 className="font-heading text-[16px] text-primary">{room.name}</h2>
                    <span
                      className={`material-symbols-outlined text-muted transition-transform ${isCollapsed ? "rotate-180" : ""}`}
                    >
                      {ACTION_ICONS.expandMore}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="-mx-4 overflow-x-auto px-4">
                      <table className="w-full min-w-[600px] border-collapse">
                        <thead>
                          <tr className="border-t border-line/50 bg-surface-low">
                            <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted">
                              Element
                            </th>
                            <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted">
                              Sursă
                            </th>
                            <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted">
                              Cant.
                            </th>
                            <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted">
                              Preț Unitar
                            </th>
                            <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted">
                              Total
                            </th>
                            <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-muted">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {roomItems.map((item) => {
                            const status = STATUS_DOT[item.status];
                            return (
                              <tr
                                key={item.id}
                                className="border-b border-line/50 transition-colors hover:bg-background"
                              >
                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className="whitespace-nowrap text-primary">
                                      {item.name}
                                    </span>
                                    <span
                                      className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] uppercase ${MATERIAL_BADGE_STYLES[item.materialType]}`}
                                    >
                                      {item.materialType}
                                    </span>
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
                                <td className="whitespace-nowrap px-3 py-3 text-right font-mono">
                                  {money(itemTotal(item))}
                                </td>
                                <td className="px-3 py-3">
                                  <div className="flex justify-center">
                                    <span
                                      className={`material-symbols-outlined text-[20px] ${status.className}`}
                                    >
                                      {status.icon}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="border-t border-line/50 bg-surface-low">
                            <td
                              colSpan={4}
                              className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-muted"
                            >
                              Total {room.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-[14px] text-muted">
                              {money(subtotal)}
                            </td>
                            <td />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>

        {/* Rezumat sticky */}
        <div className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between border-t border-line bg-surface px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase text-muted">
              Total General Estimat
            </span>
            <span className="font-mono text-[20px] text-primary">{money(estimated)}</span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 font-bold text-white active:opacity-80"
          >
            <span className="material-symbols-outlined text-[18px]">
              {DOCUMENT_ICONS.download}
            </span>
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}
