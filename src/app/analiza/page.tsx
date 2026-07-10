"use client";

import { useMemo } from "react";
import StatCard from "@/components/StatCard";
import { formatMoney, itemTotal, useStore } from "@/lib/store";

const PIE_COLORS = ["#0ea5e9", "#f97316", "#8b5cf6", "#10b981", "#64748b"];

export default function AnalizaPage() {
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
  const remaining = project.totalBudget - spent;
  const bought = items.filter((i) => i.status === "Cumpărat").length;

  const perRoom = useMemo(
    () =>
      rooms
        .map((r) => ({
          name: r.name,
          total: items
            .filter((i) => i.roomId === r.id)
            .reduce((s, i) => s + itemTotal(i), 0),
        }))
        .filter((r) => r.total > 0)
        .sort((a, b) => b.total - a.total),
    [rooms, items]
  );

  const perCategory = useMemo(() => {
    const map = new Map<string, { total: number; spent: number }>();
    for (const i of items) {
      const e = map.get(i.materialType) ?? { total: 0, spent: 0 };
      e.total += itemTotal(i);
      if (i.status === "Cumpărat") e.spent += itemTotal(i);
      map.set(i.materialType, e);
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [items]);

  // Pie chart segments
  const pieTotal = perRoom.reduce((s, r) => s + r.total, 0);
  let acc = 0;
  const segments = perRoom.map((r, idx) => {
    const start = acc / pieTotal;
    acc += r.total;
    const end = acc / pieTotal;
    return { ...r, start, end, color: PIE_COLORS[idx % PIE_COLORS.length] };
  });

  const overBudget = spent > project.totalBudget;

  return (
    <div className="px-6 py-6 lg:px-10 max-w-7xl">
      <h1 className="font-heading text-2xl font-bold">Analiză Bugetară</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total alocat"
          value={formatMoney(project.totalBudget)}
        />
        <StatCard
          label="Cheltuieli totale"
          value={formatMoney(spent)}
          accent="secondary"
        />
        <StatCard
          label="Buget rămas"
          value={formatMoney(remaining)}
          accent={remaining < 0 ? "tertiary" : "default"}
        />
        <StatCard
          label="Achiziții finalizate"
          value={`${bought} / ${items.length}`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Cost per cameră — pie */}
        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="font-heading text-lg font-semibold">
            Cost per Cameră
          </h2>
          <div className="mt-6 flex items-center gap-8">
            <svg viewBox="0 0 42 42" className="h-40 w-40 -rotate-90">
              {segments.map((s) => {
                const len = (s.end - s.start) * 100;
                return (
                  <circle
                    key={s.name}
                    cx="21"
                    cy="21"
                    r="15.9155"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="6"
                    strokeDasharray={`${len} ${100 - len}`}
                    strokeDashoffset={-s.start * 100}
                  />
                );
              })}
            </svg>
            <ul className="flex-1 space-y-2 text-sm">
              {segments.map((s) => (
                <li key={s.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: s.color }}
                    />
                    {s.name}
                  </span>
                  <span className="font-mono text-muted">
                    {Math.round(((s.end - s.start) * 100 + Number.EPSILON) * 10) / 10}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Stadiu pe categorii */}
        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="font-heading text-lg font-semibold">
            Stadiul Achizițiilor pe Categorii
          </h2>
          <ul className="mt-6 space-y-4">
            {perCategory.map(([cat, v]) => {
              const pct = v.total ? Math.round((v.spent / v.total) * 100) : 0;
              return (
                <li key={cat}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{cat}</span>
                    <span className="font-mono text-muted">
                      {formatMoney(v.total)} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-surface-low">
                    <div
                      className="h-2 rounded-full bg-secondary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Recomandări */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            💡 Optimizare recomandată
          </p>
          <p className="mt-2 text-sm text-sky-900">
            Elementele „În așteptare" însumează{" "}
            {formatMoney(
              items
                .filter((i) => i.status === "În așteptare")
                .reduce((s, i) => s + itemTotal(i), 0)
            )}
            . Compară prețurile între surse înainte de achiziție.
          </p>
        </div>
        <div
          className={`rounded-lg border p-5 ${
            overBudget
              ? "border-orange-200 bg-orange-50"
              : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <p
            className={`text-xs font-bold uppercase tracking-wide ${
              overBudget ? "text-orange-700" : "text-emerald-700"
            }`}
          >
            {overBudget ? "⚠️ Atenție: depășire buget" : "✅ Buget sub control"}
          </p>
          <p
            className={`mt-2 text-sm ${overBudget ? "text-orange-900" : "text-emerald-900"}`}
          >
            {overBudget
              ? `Cheltuielile depășesc bugetul alocat cu ${formatMoney(spent - project.totalBudget)}.`
              : `Mai ai ${formatMoney(remaining)} disponibili din bugetul total.`}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            📈 Status proiect
          </p>
          <p className="mt-2 text-sm">
            Total estimat al proiectului: {formatMoney(totalEstimated)} —{" "}
            {items.length} elemente în {rooms.length} camere.
          </p>
        </div>
      </div>
    </div>
  );
}
