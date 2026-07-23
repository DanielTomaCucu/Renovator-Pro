"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/shared/store";
import { donutSegments, formatMoney, timelinePoints, totalEstimated } from "@/shared/functions";
import { ItemStatus } from "@/shared/types";
import { ACTION_ICONS, ANALYTICS_ICONS, TECHNICAL_ICONS } from "@/shared/icons";
import DashboardSummaryCard, {
  SummaryAccentFooter,
  SummaryProgressFooter,
} from "@/components/DashboardSummaryCard";
import EmptyState from "@/components/EmptyState";
import { formatMonthLabel } from "./dates";
import SpendingTimelineChart from "./SpendingTimelineChart";

/** Paletă pastel pt. segmentele donut-ului „Cost per Cameră" (desktop) — vezi design Stitch. */
const PIE_COLORS = ["#a7f3d0", "#ddd6fe", "#fecaca", "#bae6fd", "#fde68a"];

/** Paletă monocromă pt. donut-ul mobil „Premium Black Theme" — vezi design Stitch. */
const MOBILE_PIE_COLORS = ["#000000", "#45464d", "#76777d", "#c6c6cd", "#e2e8f0"];

export default function AnalizaPage() {
  const { project, rooms, items, summary, spendingTimeline } = useStore();
  const money = (value: number) => formatMoney(value, project.currency);

  // Camera selectată prin click pe donut-ul „Cost per Cameră" (nume, nu index — segmentele nu au index
  // stabil între desktop/mobil). null = nicio selecție, centrul arată camera cu cel mai mare cost.
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Totalurile vin din agregarea server-side (summary), nu recalculate client-side (Problema 2 din audit).
  const { totalEstimated: estimated, totalSpent: spent, budgetRemaining: remaining, boughtCount: bought, purchaseProgress: progress } = summary;

  const spentPct = project.totalBudget
    ? Math.round((spent / project.totalBudget) * 100)
    : 0;
  const remainingPct = project.totalBudget
    ? Math.round((remaining / project.totalBudget) * 100)
    : 0;

  const perRoom = summary.costPerRoom;
  // Adaptare la shape-ul [categorie, {total, spent}] folosit de progress bars mai jos.
  const perCategory = useMemo(
    () => summary.costPerCategory.map((c) => [c.materialType, { total: c.total, spent: c.spent }] as const),
    [summary.costPerCategory]
  );

  const segments = useMemo(
    () =>
      donutSegments(perRoom).map((s, idx) => ({
        ...s,
        pct: Math.round((s.end - s.start) * 100),
        color: PIE_COLORS[idx % PIE_COLORS.length],
      })),
    [perRoom]
  );
  const topRoom = segments[0];
  // Camera activă în centrul donut-ului: cea selectată prin click, altfel camera cu cel mai mare cost
  // (comportamentul implicit de dinainte). `segments`/`mobileSegments` au aceleași `name`/`start`/`end`
  // (doar culorile diferă), deci selecția (după nume) e validă pe ambele.
  const activeSegment = segments.find((s) => s.name === selectedRoom) ?? null;
  const centerSegment = activeSegment ?? topRoom;

  const mobileSegments = useMemo(
    () =>
      donutSegments(perRoom).map((s, idx) => ({
        ...s,
        pct: Math.round((s.end - s.start) * 100),
        color: MOBILE_PIE_COLORS[idx % MOBILE_PIE_COLORS.length],
      })),
    [perRoom]
  );

  const overBudget = spent > project.totalBudget;
  const pendingTotal = totalEstimated(
    items.filter((i) => i.status === ItemStatus.InAsteptare)
  );
  // BIZ-3 (docs/tickete-audit-calcule-securitate.md): elementele auto-generate din configurare au
  // preț 0 până userul îl completează — fără hint, graficele par „că nu reacționează" la configurare.
  const noPriceCount = items.filter((i) => i.unitPrice === 0).length;

  // Evoluția Cheltuielilor: date REALE (Problema 3 din audit) — 2 serii cumulative (cheltuit + total),
  // pe axa unificată de luni din backend. Listă goală DOAR dacă proiectul n-are niciun element încă
  // (nu doar „nimic cumpărat" — linia de total are nevoie de elementele neachiziționate ca să crească).
  const timeline = useMemo(() => timelinePoints(spendingTimeline), [spendingTimeline]);

  return (
    <div>
      {/* Fără căutare — pagina e integral grafice/agregări, nu o listă filtrabilă (nimic de căutat). */}
      <PageHeader title="Analiză Bugetară" showSearch={false} />

      {/* Sumar — card unic cu gradient închis, identic pe mobil și desktop (design „Dashboard Premium Consolidat"). */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10">
        <DashboardSummaryCard
          metrics={[
            {
              label: "Total Alocat",
              value: money(project.totalBudget),
              footer: (
                <SummaryAccentFooter dotClassName="bg-emerald-400" textClassName="text-emerald-400">
                  Buget de referință
                </SummaryAccentFooter>
              ),
            },
            {
              label: "Cheltuieli Totale",
              value: money(spent),
              footer: <SummaryProgressFooter percent={spentPct} color="white" />,
            },
            {
              label: "Buget Rămas",
              value: money(remaining),
              footer: <SummaryAccentFooter>{remainingPct}% disponibil</SummaryAccentFooter>,
            },
            {
              label: `Achiziții Finalizate (${bought} / ${items.length})`,
              value: `${progress}%`,
              footer: <SummaryProgressFooter percent={progress} color="secondary" />,
            },
          ]}
        />
      </div>

      {rooms.length === 0 && (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
          <EmptyState
            icon={TECHNICAL_ICONS.addRoomEmpty}
            title="Niciun grafic încă"
            description="Adaugă camere și elemente de cumpărat ca să vezi aici distribuția costurilor și evoluția cheltuielilor."
            actionLabel="Mergi la Configurare"
            actionHref="/configurare"
          />
        </div>
      )}

      {/* Desktop — bento grid, vezi „Analiză Bugetară - Meniu Restrâns Premium v2" */}
      <div className={`mx-auto ${rooms.length === 0 ? "hidden" : "hidden md:block"} max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-10`}>
        {/* Grafice */}
        <div className="grid grid-cols-12 gap-6">
          {/* Evoluția Cheltuielilor — date REALE, pe luna cumpărării (Problema 3 din audit). */}
          <div className="col-span-12 rounded-xl border border-line bg-surface p-6 shadow-sm sm:p-8 lg:col-span-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-primary/80">
                  {ANALYTICS_ICONS.expenseTimeline}
                </span>
                <h3 className="font-heading text-[16px] tracking-tight text-primary">
                  Evoluția Cheltuielilor
                </h3>
              </div>
              {timeline.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-[11px] uppercase tracking-wider text-muted">Cheltuit cumulat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted/50" />
                    <span className="text-[11px] uppercase tracking-wider text-muted">Total (+ în așteptare)</span>
                  </div>
                </div>
              )}
            </div>
            {timeline.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                <span className="material-symbols-outlined text-4xl text-muted/40">
                  {ANALYTICS_ICONS.expenseTimeline}
                </span>
                <p className="max-w-xs text-sm text-muted">
                  Niciun element încă — evoluția cheltuielilor apare aici pe măsură ce adaugi elemente
                  și le marchezi ca „Cumpărat”.
                </p>
              </div>
            ) : (
              <>
                <div className="h-64 w-full">
                  <SpendingTimelineChart timeline={timeline} money={money} />
                </div>
                <div className="mt-4 flex justify-between px-2 text-[11px] uppercase tracking-wider text-muted">
                  {timeline.map((p) => (
                    <span key={p.month}>{formatMonthLabel(p.month)}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cost per cameră — donut */}
          <div className="col-span-12 flex flex-col rounded-xl border border-line bg-surface p-6 shadow-sm lg:col-span-4">
            <div className="mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-primary/80">
                {ANALYTICS_ICONS.costPerRoom}
              </span>
              <h3 className="font-heading text-[16px] tracking-tight text-primary">
                Cost per Cameră
              </h3>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center">
              <div className="relative mb-8 h-44 w-44">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    fill="transparent"
                    r="15.915"
                    strokeWidth="3.5"
                    className="stroke-surface-low"
                  />
                  {segments.map((s) => {
                    const isActive = activeSegment?.name === s.name;
                    const dimmed = activeSegment !== null && !isActive;
                    return (
                      <circle
                        key={s.name}
                        cx="18"
                        cy="18"
                        fill="transparent"
                        r="15.915"
                        stroke={s.color}
                        strokeDasharray={`${s.pct} ${100 - s.pct}`}
                        strokeDashoffset={-s.start * 100}
                        strokeWidth={isActive ? "5" : "3.5"}
                        opacity={dimmed ? 0.35 : 1}
                        className="cursor-pointer transition-all"
                        onClick={() => setSelectedRoom((cur) => (cur === s.name ? null : s.name))}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="mb-0.5 text-[10px] uppercase tracking-[0.2em] text-muted">
                    {activeSegment ? "Selectat" : "Top Room"}
                  </span>
                  <span className="text-[18px] font-bold leading-tight text-primary">
                    {centerSegment?.name ?? "—"}
                  </span>
                  <span className="text-[13px] font-medium text-muted">
                    {money(centerSegment?.total ?? 0)}
                  </span>
                  {activeSegment && (
                    <button
                      type="button"
                      onClick={() => setSelectedRoom(null)}
                      className="mt-1.5 flex items-center gap-0.5 text-[10px] font-bold text-secondary hover:underline"
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {ACTION_ICONS.close}
                      </span>
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3">
                {segments.map((s) => {
                  const isActive = activeSegment?.name === s.name;
                  return (
                    <button
                      type="button"
                      key={s.name}
                      onClick={() => setSelectedRoom((cur) => (cur === s.name ? null : s.name))}
                      className={`flex items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-surface-low ${
                        isActive ? "bg-secondary/10 ring-1 ring-secondary/40" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-[12px] font-medium text-muted">{s.name}</span>
                      </div>
                      <span className="text-[12px] font-bold text-primary">{s.pct}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stadiu pe categorii */}
          <div className="col-span-12 rounded-xl border border-line bg-surface p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-primary/80">
                {ANALYTICS_ICONS.categoryBreakdown}
              </span>
              <h3 className="font-heading text-[16px] tracking-tight text-primary">
                Stadiul Achizițiilor pe Categorii
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {perCategory.map(([cat, v]) => {
                const pct = v.total ? Math.round((v.spent / v.total) * 100) : 0;
                return (
                  <div
                    key={cat}
                    className="flex flex-col gap-3 rounded-xl border border-line bg-gradient-to-tr from-surface to-primary/5 p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <p className="whitespace-nowrap text-sm text-muted">{cat}</p>
                    <div>
                      <div className="mb-2 flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
                        <p className="whitespace-nowrap font-mono text-[15px] font-bold leading-none text-primary">
                          {money(v.total)}
                        </p>
                        <span className="shrink-0 text-xs font-bold text-primary">{pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-line/40">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-1000"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recomandări */}
          <div className="col-span-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex items-start gap-4 rounded-xl border border-line bg-surface-low/50 p-6 transition-all hover:shadow-sm">
              <div className="rounded-lg border border-line bg-surface p-2">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  {ANALYTICS_ICONS.tipOptimizare}
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-secondary">
                  Optimizare Recomandată
                </h4>
                <p className="text-[13px] leading-relaxed text-muted">
                  Elementele „În așteptare” însumează {money(pendingTotal)}. Compară
                  prețurile între surse înainte de achiziție.
                </p>
              </div>
            </div>

            <div
              className={`flex items-start gap-4 rounded-xl border p-6 transition-all hover:shadow-sm ${
                overBudget ? "border-tertiary/10 bg-tertiary/5" : "border-emerald-600/10 bg-emerald-600/5"
              }`}
            >
              <div
                className={`rounded-lg border bg-surface p-2 ${overBudget ? "border-tertiary/10" : "border-emerald-600/10"}`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${overBudget ? "text-tertiary" : "text-emerald-600"}`}
                >
                  {overBudget ? ANALYTICS_ICONS.alertaBuget : ANALYTICS_ICONS.statusProiect}
                </span>
              </div>
              <div className="space-y-1">
                <h4
                  className={`text-[11px] font-bold uppercase tracking-widest ${overBudget ? "text-tertiary" : "text-emerald-600"}`}
                >
                  {overBudget ? "Atenție: Depășire Buget" : "Buget Sub Control"}
                </h4>
                <p className="text-[13px] leading-relaxed text-muted">
                  {overBudget
                    ? `Cheltuielile depășesc bugetul alocat cu ${money(spent - project.totalBudget)}.`
                    : `Mai ai ${money(remaining)} disponibili din bugetul total.`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-emerald-600/10 bg-emerald-600/5 p-6 transition-all hover:shadow-sm">
              <div className="rounded-lg border border-emerald-600/10 bg-surface p-2">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">
                  {ANALYTICS_ICONS.statusProiect}
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                  Status Proiect
                </h4>
                <p className="text-[13px] leading-relaxed text-muted">
                  Total estimat al proiectului: {money(estimated)} — {items.length}{" "}
                  elemente în {rooms.length} camere.
                </p>
              </div>
            </div>

            {noPriceCount > 0 && (
              <div className="flex items-start gap-4 rounded-xl border border-tertiary/10 bg-tertiary/5 p-6 transition-all hover:shadow-sm">
                <div className="rounded-lg border border-tertiary/10 bg-surface p-2">
                  <span className="material-symbols-outlined text-[20px] text-tertiary">
                    {ANALYTICS_ICONS.alertaBuget}
                  </span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-tertiary">
                    Elemente Fără Preț
                  </h4>
                  <p className="text-[13px] leading-relaxed text-muted">
                    {noPriceCount} {noPriceCount === 1 ? "element nu are" : "elemente nu au"} preț
                    completat (generate automat din Configurare) — nu contribuie la totaluri până le
                    completezi în „Elemente de Cumpărat”.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobil — vezi „Analiză Bugetară - Mobile Premium Black Theme" (fără bottom nav, se face în Flutter) */}
      <div className={`space-y-6 px-4 py-6 ${rooms.length === 0 ? "hidden" : "md:hidden"}`}>
        {/* Grafice */}
        <section className="space-y-3">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h3 className="mb-4 text-[12px] font-bold uppercase tracking-wider text-muted">
              Evoluția Cheltuielilor
            </h3>
            {timeline.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted">
                Niciun element încă.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-4 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-[9px] uppercase tracking-wider text-muted">Cheltuit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted/50" />
                    <span className="text-[9px] uppercase tracking-wider text-muted">Total</span>
                  </div>
                </div>
                <div className="h-48 w-full">
                  <SpendingTimelineChart timeline={timeline} money={money} />
                </div>
                <div className="mt-2 flex justify-between px-2 text-[10px] font-bold uppercase text-muted">
                  {timeline.map((p) => (
                    <span key={p.month}>{formatMonthLabel(p.month)}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted">
                Cost per Cameră
              </h3>
              {activeSegment && (
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="flex items-center gap-0.5 text-[10px] font-bold text-secondary"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    {ACTION_ICONS.close}
                  </span>
                  Reset
                </button>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    fill="transparent"
                    r="15.915"
                    strokeWidth="3.5"
                    className="stroke-surface-low"
                  />
                  {mobileSegments.map((s) => {
                    const isActive = activeSegment?.name === s.name;
                    const dimmed = activeSegment !== null && !isActive;
                    return (
                      <circle
                        key={s.name}
                        cx="18"
                        cy="18"
                        fill="transparent"
                        r="15.915"
                        stroke={s.color}
                        strokeDasharray={`${s.pct} ${100 - s.pct}`}
                        strokeDashoffset={-s.start * 100}
                        strokeWidth={isActive ? "5" : "3.5"}
                        opacity={dimmed ? 0.35 : 1}
                        className="cursor-pointer transition-all"
                        onClick={() => setSelectedRoom((cur) => (cur === s.name ? null : s.name))}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-surface p-1 text-center">
                  <span className="truncate text-[9px] font-bold leading-tight text-primary">
                    {centerSegment?.name ?? "—"}
                  </span>
                  <span className="font-mono text-[10px] leading-tight text-primary">
                    {money(centerSegment?.total ?? 0)}
                  </span>
                </div>
              </div>
              <div className="flex-grow space-y-2">
                {mobileSegments.map((s) => {
                  const isActive = activeSegment?.name === s.name;
                  return (
                    <button
                      type="button"
                      key={s.name}
                      onClick={() => setSelectedRoom((cur) => (cur === s.name ? null : s.name))}
                      className={`flex w-full items-center gap-2 rounded-lg p-1 text-left transition-colors ${
                        isActive ? "bg-secondary/10" : ""
                      }`}
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-[14px] text-foreground">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Categorii */}
        <section className="space-y-3">
          <h2 className="font-heading text-[20px] font-semibold text-foreground">
            Stadiul pe Categorii
          </h2>
          <div className="flex flex-col gap-3">
            {perCategory.map(([cat, v]) => {
              const pct = v.total ? Math.round((v.spent / v.total) * 100) : 0;
              return (
                <div
                  key={cat}
                  className="space-y-3 rounded-xl border border-line bg-surface p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{cat}</span>
                    <span className="font-mono font-bold text-primary">
                      {money(v.total)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 flex-grow overflow-hidden rounded-full bg-surface-low">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="min-w-[32px] text-[12px] font-bold text-foreground">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sugestii */}
        <section className="space-y-3">
          <h2 className="font-heading text-[20px] font-semibold text-foreground">
            Sugestii &amp; Analiză
          </h2>

          <div className="flex gap-4 rounded-xl border border-line bg-surface p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <span className="material-symbols-outlined">{ANALYTICS_ICONS.economii}</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-[12px] font-bold uppercase text-primary">
                Optimizare Costuri
              </h4>
              <p className="text-[14px] text-muted">
                Elementele „În așteptare” însumează {money(pendingTotal)}. Compară
                prețurile între surse înainte de achiziție.
              </p>
            </div>
          </div>

          <div
            className={`flex gap-4 rounded-xl border p-5 ${overBudget ? "border-tertiary/20 bg-tertiary/10" : "border-line bg-surface"}`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${overBudget ? "bg-tertiary/20" : "bg-surface-low"}`}
            >
              <span
                className={`material-symbols-outlined ${overBudget ? "text-tertiary" : "text-primary"}`}
              >
                {overBudget ? ACTION_ICONS.confirmDelete : ANALYTICS_ICONS.statusProiect}
              </span>
            </div>
            <div className="space-y-1">
              <h4
                className={`text-[12px] font-bold uppercase ${overBudget ? "text-tertiary" : "text-primary"}`}
              >
                {overBudget ? "Atenție Depășire" : "Buget Sub Control"}
              </h4>
              <p className="text-[14px] text-muted">
                {overBudget
                  ? `Cheltuielile depășesc bugetul alocat cu ${money(spent - project.totalBudget)}.`
                  : `Mai ai ${money(remaining)} disponibili din bugetul total.`}
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl border border-line bg-surface p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-low">
              <span className="material-symbols-outlined text-primary">
                {ANALYTICS_ICONS.actualizare}
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-[12px] font-bold uppercase text-primary">Status Proiect</h4>
              <p className="text-[14px] text-muted">
                Total estimat al proiectului: {money(estimated)} — {items.length} elemente
                în {rooms.length} camere.
              </p>
            </div>
          </div>

          {noPriceCount > 0 && (
            <div className="flex gap-4 rounded-xl border border-tertiary/20 bg-tertiary/10 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary/20">
                <span className="material-symbols-outlined text-tertiary">
                  {ANALYTICS_ICONS.alertaBuget}
                </span>
              </div>
              <div className="space-y-1">
                <h4 className="text-[12px] font-bold uppercase text-tertiary">Elemente Fără Preț</h4>
                <p className="text-[14px] text-muted">
                  {noPriceCount} {noPriceCount === 1 ? "element nu are" : "elemente nu au"} preț completat
                  — nu contribuie la totaluri până le completezi în „Elemente de Cumpărat”.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
