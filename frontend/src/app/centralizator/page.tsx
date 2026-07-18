"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import SortableTh from "@/components/SortableTh";
import { useStore } from "@/shared/store";
import {
  budgetEfficiency,
  formatMoney,
  itemTotal,
  itemsForRoom,
  roomSubtotal,
} from "@/shared/functions";
import { useSortableTable } from "@/shared/useSortableTable";
import { Item, ItemStatus, MaterialType } from "@/shared/types";
import {
  CENTRALIZATOR_ICONS,
  ACTION_ICONS,
  DOCUMENT_ICONS,
  ROOM_TYPE_ICONS,
  STATUS_ICONS,
  TECHNICAL_ICONS,
} from "@/shared/icons";
import DashboardSummaryCard, {
  SummaryAccentFooter,
  SummaryProgressFooter,
} from "@/components/DashboardSummaryCard";

type CentralizatorSortKey =
  | "name"
  | "materialType"
  | "source"
  | "quantity"
  | "unitPrice"
  | "total"
  | "status";

function getCentralizatorSortValue(item: Item, key: CentralizatorSortKey): string | number {
  switch (key) {
    case "name":
      return item.name;
    case "materialType":
      return item.materialType;
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

function matchesSearch(item: Item, query: string): boolean {
  if (!query.trim()) return true;
  const normalize = (s: string) =>
    s
      .toLocaleLowerCase("ro")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  const q = normalize(query);
  return (
    normalize(item.name).includes(q) ||
    normalize(item.source).includes(q) ||
    normalize(item.materialType).includes(q)
  );
}

/** Culoare de fundal/text a badge-ului „Tip” per categorie de material — vezi design Stitch. */
/** O culoare distinctă per categorie — înainte erau doar 4 nuanțe reale pentru 12 tipuri (mult
    albastru/gri repetat, greu de deosebit dintr-o privire); acum fiecare tip are propria culoare. */
const MATERIAL_BADGE_STYLES: Record<MaterialType, string> = {
  [MaterialType.Gresie]: "bg-stone-100 text-stone-700",
  [MaterialType.Faianta]: "bg-cyan-50 text-cyan-700",
  [MaterialType.Plinta]: "bg-lime-50 text-lime-700",
  [MaterialType.Parchet]: "bg-amber-50 text-amber-700",
  [MaterialType.Vopsea]: "bg-rose-50 text-rose-700",
  [MaterialType.Tapet]: "bg-fuchsia-50 text-fuchsia-700",
  [MaterialType.GlafFereastra]: "bg-teal-50 text-teal-700",
  [MaterialType.Sanitare]: "bg-indigo-50 text-indigo-700",
  [MaterialType.Mobila]: "bg-violet-50 text-violet-700",
  [MaterialType.Electrocasnice]: "bg-red-50 text-red-700",
  [MaterialType.CorpuriIluminat]: "bg-yellow-50 text-yellow-700",
  [MaterialType.Altele]: "bg-slate-100 text-slate-600",
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
  const [search, setSearch] = useState("");
  const {
    sorted: sortedItems,
    sortKey,
    direction,
    toggleSort,
  } = useSortableTable<Item, CentralizatorSortKey>(items, getCentralizatorSortValue);
  const visibleItems = sortedItems.filter((item) => matchesSearch(item, search));

  // Totalurile de proiect vin din agregarea server-side (Problema 2 din audit); subtotalul/itemii
  // per cameră rămân calculați client-side (randare de detaliu, nu agregat de dashboard).
  const { totalEstimated: estimated, totalSpent: spent } = summary;
  const efficiency = budgetEfficiency(estimated, spent);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Import dinamic — @react-pdf/renderer e destul de greu, nu are rost în bundle-ul inițial al
  // paginii, doar la apăsarea efectivă a butonului de export (aceeași abordare ca în Configurare).
  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const [{ pdf }, { default: CentralizatorPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./CentralizatorPdfDocument"),
      ]);
      const blob = await pdf(
        <CentralizatorPdfDocument
          project={project}
          rooms={rooms}
          items={items}
          estimated={estimated}
          spent={spent}
          efficiency={efficiency}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${project.title.replace(/[^\p{L}\p{N}]+/gu, "-")}-tabel-centralizator.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingPdf(false);
    }
  };

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
      <PageHeader
        title="Centralizator Costuri"
        searchPlaceholder="Caută element sau lucrare..."
        searchValue={search}
        onSearchChange={setSearch}
      />

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
          <div className="flex items-center justify-between border-b border-line bg-surface px-6 py-4 sm:px-8">
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
              <thead className="border-b border-line bg-surface">
                <tr>
                  <SortableTh
                    label="Element / Tip Lucrare"
                    sortKey="name"
                    activeKey={sortKey}
                    direction={direction}
                    onSort={toggleSort}
                  />
                  <SortableTh
                    label="Tip"
                    sortKey="materialType"
                    activeKey={sortKey}
                    direction={direction}
                    onSort={toggleSort}
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
                    label="Preț Unitar"
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
                    align="center"
                    className="w-24"
                  />
                </tr>
              </thead>

              {rooms.map((room) => {
                const allRoomItems = itemsForRoom(items, room.id);
                const roomItems = itemsForRoom(visibleItems, room.id);
                const subtotal = roomSubtotal(items, room.id);
                if (allRoomItems.length === 0) return null;
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

                    {!isCollapsed && roomItems.length === 0 && (
                      <tr>
                        <td className="px-4 py-3 text-[13px] text-muted" colSpan={7}>
                          {`Niciun element nu corespunde căutării „${search}" în această cameră.`}
                        </td>
                      </tr>
                    )}

                    {!isCollapsed &&
                      roomItems.map((item) => {
                        const status = STATUS_DOT[item.status];
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-line/50 transition-colors hover:bg-background"
                          >
                            <td className="max-w-[260px] px-4 py-3 text-[13px] text-foreground">
                              <span className="block truncate" title={item.name}>
                                {item.name}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[13px]">
                              <span
                                title={item.materialType}
                                className={`inline-block max-w-[140px] truncate whitespace-nowrap rounded-full px-3 py-1 text-[11px] uppercase tracking-wider ${MATERIAL_BADGE_STYLES[item.materialType]}`}
                              >
                                {item.materialType}
                              </span>
                            </td>
                            <td className="max-w-[160px] px-4 py-3 text-[13px] text-muted">
                              <span className="block truncate" title={item.source}>
                                {item.source}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[13px] text-muted">
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
              onClick={handleExportPdf}
              disabled={exportingPdf || items.length === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line px-6 py-3 text-sm font-medium transition-all hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
            >
              <span className="material-symbols-outlined text-[20px] opacity-60">
                {exportingPdf ? TECHNICAL_ICONS.calculatedResults : DOCUMENT_ICONS.download}
              </span>
              {exportingPdf ? "Se generează..." : "Export PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil — vezi „Centralizator Costuri - Mobile Table View" (fără bottom nav, se face în Flutter) */}
      <div className="pb-40 md:hidden">
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
                                className="border-b border-line/50 bg-surface transition-colors hover:bg-background"
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

        {/* Rezumat sticky — pe mobil stă deasupra bottom nav-ului global (`bottom-16`, înălțimea lui `BottomNav`); pe desktop, unde nu există bottom nav, rămâne lipit de fundul ecranului. */}
        <div className="fixed bottom-16 left-0 z-40 flex w-full items-center justify-between border-t border-line bg-surface px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:bottom-0">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase text-muted">
              Total General Estimat
            </span>
            <span className="font-mono text-[20px] text-primary">{money(estimated)}</span>
          </div>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || items.length === 0}
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 font-bold text-white active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {exportingPdf ? TECHNICAL_ICONS.calculatedResults : DOCUMENT_ICONS.download}
            </span>
            {exportingPdf ? "Se generează..." : "PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
