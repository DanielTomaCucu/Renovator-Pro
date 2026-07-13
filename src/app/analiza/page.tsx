"use client";

import { useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/shared/store";
import {
  boughtCount,
  budgetRemaining,
  costPerCategory,
  costPerRoom,
  donutSegments,
  formatMoney,
  purchaseProgress,
  totalEstimated,
  totalSpent,
} from "@/shared/functions";
import { ItemStatus } from "@/shared/types";
import { ACTION_ICONS, ANALYTICS_ICONS, DOCUMENT_ICONS } from "@/shared/icons";

/** Paletă pastel pt. segmentele donut-ului „Cost per Cameră" (desktop) — vezi design Stitch. */
const PIE_COLORS = ["#a7f3d0", "#ddd6fe", "#fecaca", "#bae6fd", "#fde68a"];

/** Paletă monocromă pt. donut-ul mobil „Premium Black Theme" — vezi design Stitch. */
const MOBILE_PIE_COLORS = ["#000000", "#45464d", "#76777d", "#c6c6cd", "#e2e8f0"];

export default function AnalizaPage() {
  const { project, rooms, items } = useStore();

  const estimated = useMemo(() => totalEstimated(items), [items]);
  const spent = useMemo(() => totalSpent(items), [items]);
  const remaining = budgetRemaining(project.totalBudget, items);
  const bought = boughtCount(items);
  const progress = purchaseProgress(items);

  const spentPct = project.totalBudget
    ? Math.round((spent / project.totalBudget) * 100)
    : 0;
  const remainingPct = project.totalBudget
    ? Math.round((remaining / project.totalBudget) * 100)
    : 0;

  const perRoom = useMemo(() => costPerRoom(rooms, items), [rooms, items]);
  const perCategory = useMemo(() => costPerCategory(items), [items]);

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

      {/* Desktop — bento grid, vezi „Analiză Bugetară - Meniu Restrâns Premium v2" */}
      <div className="mx-auto hidden max-w-7xl space-y-8 px-4 py-6 sm:px-6 md:block lg:px-10">
        {/* Sumar — card unic cu gradient închis, vezi „Analiză Bugetară - Dashboard Premium Consolidat Desktop" */}
        <div
          className="w-full overflow-hidden rounded-xl p-8 text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #000000 100%)" }}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            <div className="min-w-0 space-y-2 border-white/10 pr-4 lg:border-r">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                Total Alocat
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className="block truncate font-mono font-bold tracking-tight"
                  style={{ fontSize: "clamp(18px, 2.2vw, 32px)" }}
                >
                  {formatMoney(project.totalBudget)}
                </span>
              </div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">
                Buget de referință
              </p>
            </div>

            <div className="min-w-0 space-y-2 border-white/10 pr-4 lg:border-r">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                Cheltuieli Totale
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className="block truncate font-mono font-bold tracking-tight"
                  style={{ fontSize: "clamp(18px, 2.2vw, 32px)" }}
                >
                  {formatMoney(spent)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${Math.min(100, spentPct)}%` }}
                  />
                </div>
                <span className="shrink-0 font-mono text-[10px] opacity-60">{spentPct}%</span>
              </div>
            </div>

            <div className="min-w-0 space-y-2 border-white/10 pr-4 lg:border-r">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                Buget Rămas
              </p>
              <div className="flex items-baseline gap-1">
                <span
                  className={`block truncate font-mono font-bold tracking-tight ${remaining < 0 ? "text-tertiary" : ""}`}
                  style={{ fontSize: "clamp(18px, 2.2vw, 32px)" }}
                >
                  {formatMoney(remaining)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                <span className="truncate text-[11px] font-medium uppercase tracking-wider opacity-60">
                  {remainingPct}% disponibil
                </span>
              </div>
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[10px] font-bold uppercase tracking-widest opacity-70">
                  Achiziții Finalizate
                </p>
                <p className="shrink-0 font-mono text-[10px] opacity-80">
                  {bought} / {items.length}
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="font-mono font-bold tracking-tight"
                  style={{ fontSize: "clamp(18px, 2.2vw, 32px)" }}
                >
                  {progress}
                </span>
                <span className="text-[18px] font-medium opacity-60">%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-secondary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Grafice */}
        <div className="grid grid-cols-12 gap-6">
          {/* Evoluția Cheltuielilor — placeholder vizual, fără date reale (vezi backlog #4) */}
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[11px] uppercase tracking-wider text-muted">
                    Realizat
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-line" />
                  <span className="text-[11px] uppercase tracking-wider text-muted">
                    Estimare
                  </span>
                </div>
              </div>
            </div>
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
                <path
                  d="M0,180 Q100,160 200,120 T400,90 T600,60 T800,40"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="3"
                />
                <path
                  d="M0,180 Q100,160 200,120 T400,90 T600,60 T800,40 L800,200 L0,200 Z"
                  fill="url(#expense-gradient)"
                />
              </svg>
            </div>
            <div className="mt-4 flex justify-between px-2 text-[11px] uppercase tracking-wider text-muted">
              <span>Ian</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>Mai</span>
              <span>Iun</span>
              <span>Iul</span>
            </div>
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
                    {formatMoney(topRoom?.total ?? 0)}
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
                          {formatMoney(v.total)}
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
                  Elementele „În așteptare” însumează {formatMoney(pendingTotal)}. Compară
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
                    ? `Cheltuielile depășesc bugetul alocat cu ${formatMoney(spent - project.totalBudget)}.`
                    : `Mai ai ${formatMoney(remaining)} disponibili din bugetul total.`}
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
                  Total estimat al proiectului: {formatMoney(estimated)} — {items.length}{" "}
                  elemente în {rooms.length} camere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobil — vezi „Analiză Bugetară - Mobile Premium Black Theme" (fără bottom nav, se face în Flutter) */}
      <div className="mx-auto max-w-md space-y-6 px-4 py-6 md:hidden">
        {/* KPI — card unic cu gradient, vezi „Analiză Bugetară - Mobile Premium Light Gradient Layout" */}
        <section
          className="rounded-xl border border-line p-4 shadow-sm"
          style={{ background: "linear-gradient(135deg, #ffffff 0%, var(--surface-low) 100%)" }}
        >
          <div className="grid grid-cols-2 gap-6 border-b border-line/60 pb-3">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Total Alocat
              </p>
              <p className="font-mono text-[15px] text-foreground">
                {formatMoney(project.totalBudget)}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Cheltuieli Totale
              </p>
              <p className="font-mono text-[15px] text-foreground">{formatMoney(spent)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 items-end gap-6 pt-3">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Buget Rămas
              </p>
              <p
                className={`font-mono text-[20px] font-semibold ${remaining < 0 ? "text-tertiary" : "text-foreground"}`}
              >
                {formatMoney(remaining)}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  Achiziții Finalizate
                </p>
                <p className="font-mono text-[10px] text-foreground">
                  {bought} / {items.length}
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-low">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Grafice */}
        <section className="space-y-3">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h3 className="mb-4 text-[12px] font-bold uppercase tracking-wider text-muted">
              Evoluția Cheltuielilor
            </h3>
            <div className="relative flex h-48 w-full items-end justify-between px-2">
              <div className="h-[20%] w-8 rounded-t bg-surface-low" />
              <div className="h-[45%] w-8 rounded-t bg-surface-low" />
              <div className="h-[75%] w-8 rounded-t border-x border-t border-primary bg-line" />
              <div className="h-[90%] w-8 rounded-t bg-primary" />
              <div className="h-[55%] w-8 rounded-t bg-surface-low" />
              <div className="absolute -bottom-6 left-0 flex w-full justify-between text-[10px] font-bold uppercase text-muted">
                <span>Ian</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>Mai</span>
              </div>
            </div>
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
                    {formatMoney(estimated)}
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
                      {formatMoney(v.total)}
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
                Elementele „În așteptare” însumează {formatMoney(pendingTotal)}. Compară
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
                  ? `Cheltuielile depășesc bugetul alocat cu ${formatMoney(spent - project.totalBudget)}.`
                  : `Mai ai ${formatMoney(remaining)} disponibili din bugetul total.`}
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
                Total estimat al proiectului: {formatMoney(estimated)} — {items.length} elemente
                în {rooms.length} camere.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
