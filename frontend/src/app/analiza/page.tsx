"use client";

import { useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/shared/store";
import { donutSegments, formatMoney, timelinePoints, totalEstimated } from "@/shared/functions";
import { ItemStatus } from "@/shared/types";
import { ACTION_ICONS, ANALYTICS_ICONS, DOCUMENT_ICONS } from "@/shared/icons";
import DashboardSummaryCard, {
  SummaryAccentFooter,
  SummaryProgressFooter,
} from "@/components/DashboardSummaryCard";
import { formatMonthLabel } from "./dates";

/** Padding vertical al viewBox-ului (0 0 800 200) pt. graficul de evoluție — nu chiar marginile, ca linia să nu atingă marginile. */
const TIMELINE_PAD_TOP = 30;
const TIMELINE_PAD_BOTTOM = 180;
const toScreenX = (x: number) => x * 800;
const toScreenY = (y: number) => TIMELINE_PAD_BOTTOM - y * (TIMELINE_PAD_BOTTOM - TIMELINE_PAD_TOP);

/** Paletă pastel pt. segmentele donut-ului „Cost per Cameră" (desktop) — vezi design Stitch. */
const PIE_COLORS = ["#a7f3d0", "#ddd6fe", "#fecaca", "#bae6fd", "#fde68a"];

/** Paletă monocromă pt. donut-ul mobil „Premium Black Theme" — vezi design Stitch. */
const MOBILE_PIE_COLORS = ["#000000", "#45464d", "#76777d", "#c6c6cd", "#e2e8f0"];

export default function AnalizaPage() {
  const { project, rooms, items, summary, spendingTimeline } = useStore();
  const money = (value: number) => formatMoney(value, project.currency);

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

  const mobileSegments = useMemo(
    () =>
      donutSegments(perRoom).map((s, idx) => ({
        ...s,
        pct: Math.round((s.end - s.start) * 100),
        color: MOBILE_PIE_COLORS[idx % MOBILE_PIE_COLORS.length],
      })),
    [perRoom]
  );
  const mobileConicGradient = mobileSegments.length
    ? `conic-gradient(${mobileSegments
        .map((s) => `${s.color} ${s.start * 100}% ${s.end * 100}%`)
        .join(", ")})`
    : "conic-gradient(var(--color-surface-low, #eff4ff) 0% 100%)";

  const overBudget = spent > project.totalBudget;
  const pendingTotal = totalEstimated(
    items.filter((i) => i.status === ItemStatus.InAsteptare)
  );

  // Evoluția Cheltuielilor: date REALE (Problema 3 din audit) — serie cumulativă pe luna cumpărării,
  // nu mai o curbă hardcodată. Listă goală → empty-state (randat mai jos), nu o curbă falsă.
  const timeline = useMemo(() => timelinePoints(spendingTimeline), [spendingTimeline]);
  const timelineLinePath = useMemo(
    () =>
      timeline.length < 2
        ? ""
        : timeline.map((p, i) => `${i === 0 ? "M" : "L"}${toScreenX(p.x)},${toScreenY(p.y)}`).join(" "),
    [timeline]
  );
  const timelineAreaPath = useMemo(() => {
    if (timeline.length < 2) return "";
    const first = timeline[0];
    const last = timeline[timeline.length - 1];
    return `${timelineLinePath} L${toScreenX(last.x)},200 L${toScreenX(first.x)},200 Z`;
  }, [timeline, timelineLinePath]);

  return (
    <div>
      <PageHeader
        title="Analiză Bugetară"
        searchPlaceholder="Caută date..."
        actions={
          <button
            onClick={() => window.print()}
            className="hidden items-center justify-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-surface-low sm:flex"
          >
            <span className="material-symbols-outlined text-[20px]">
              {DOCUMENT_ICONS.exportPdf}
            </span>
            Export PDF
          </button>
        }
      />

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

      {/* Desktop — bento grid, vezi „Analiză Bugetară - Meniu Restrâns Premium v2" */}
      <div className="mx-auto hidden max-w-7xl space-y-8 px-4 py-6 sm:px-6 md:block lg:px-10">
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
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[11px] uppercase tracking-wider text-muted">
                    Cheltuit cumulat
                  </span>
                </div>
              )}
            </div>
            {timeline.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                <span className="material-symbols-outlined text-4xl text-muted/40">
                  {ANALYTICS_ICONS.expenseTimeline}
                </span>
                <p className="max-w-xs text-sm text-muted">
                  Niciun element cumpărat încă — evoluția cheltuielilor apare aici pe măsură ce
                  marchezi elemente ca „Cumpărat”.
                </p>
              </div>
            ) : (
              <>
                <div className="relative h-64 w-full overflow-hidden">
                  <svg
                    className="h-full w-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 800 200"
                  >
                    <defs>
                      <linearGradient id="expense-gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#000000" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="800" y1="50" y2="50" />
                    <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="800" y1="100" y2="100" />
                    <line stroke="#f1f5f9" strokeWidth="1" x1="0" x2="800" y1="150" y2="150" />
                    {timeline.length === 1 ? (
                      <circle cx="400" cy={toScreenY(timeline[0].y)} r="5" fill="#000000" />
                    ) : (
                      <>
                        <path d={timelineLinePath} fill="none" stroke="#000000" strokeWidth="3" />
                        <path d={timelineAreaPath} fill="url(#expense-gradient)" />
                      </>
                    )}
                  </svg>
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
                  {segments.map((s) => (
                    <circle
                      key={s.name}
                      cx="18"
                      cy="18"
                      fill="transparent"
                      r="15.915"
                      stroke={s.color}
                      strokeDasharray={`${s.pct} ${100 - s.pct}`}
                      strokeDashoffset={-s.start * 100}
                      strokeWidth="3.5"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="mb-0.5 text-[10px] uppercase tracking-[0.2em] text-muted">
                    Top Room
                  </span>
                  <span className="text-[18px] font-bold leading-tight text-primary">
                    {topRoom?.name ?? "—"}
                  </span>
                  <span className="text-[13px] font-medium text-muted">
                    {money(topRoom?.total ?? 0)}
                  </span>
                </div>
              </div>
              <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3">
                {segments.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-low"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-[12px] font-medium text-muted">{s.name}</span>
                    </div>
                    <span className="text-[12px] font-bold text-primary">{s.pct}%</span>
                  </div>
                ))}
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
          </div>
        </div>
      </div>

      {/* Mobil — vezi „Analiză Bugetară - Mobile Premium Black Theme" (fără bottom nav, se face în Flutter) */}
      <div className="mx-auto max-w-md space-y-6 px-4 py-6 md:hidden">
        {/* Grafice */}
        <section className="space-y-3">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h3 className="mb-4 text-[12px] font-bold uppercase tracking-wider text-muted">
              Evoluția Cheltuielilor
            </h3>
            {timeline.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted">
                Niciun element cumpărat încă.
              </p>
            ) : (
              <>
                <div className="flex h-48 w-full items-end justify-between gap-2 px-2">
                  {timeline.map((p) => (
                    <div key={p.month} className="flex h-full flex-1 items-end justify-center">
                      <div
                        className="w-full max-w-8 rounded-t bg-primary"
                        style={{ height: `${Math.max(p.y * 100, 4)}%` }}
                      />
                    </div>
                  ))}
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
            <h3 className="mb-4 text-[12px] font-bold uppercase tracking-wider text-muted">
              Cost per Cameră
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 shrink-0">
                <div
                  className="h-full w-full rounded-full"
                  style={{ background: mobileConicGradient }}
                />
                <div className="absolute inset-4 flex items-center justify-center rounded-full bg-surface p-1 text-center">
                  <span className="font-mono text-[10px] leading-tight text-primary">
                    {money(estimated)}
                  </span>
                </div>
              </div>
              <div className="flex-grow space-y-2">
                {mobileSegments.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-[14px] text-foreground">{s.name}</span>
                  </div>
                ))}
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
        </section>
      </div>
    </div>
  );
}
