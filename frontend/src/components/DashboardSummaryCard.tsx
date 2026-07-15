"use client";

/**
 * Card de sumar cu gradient închis (negru→navy) — design unic, folosit pe TOATE
 * paginile (Elemente, Centralizator, Analiză, Configurare), pe desktop ȘI pe mobil,
 * ca să existe un singur limbaj vizual pentru header-ele de statistici din aplicație.
 * Vezi design Stitch „Analiză Bugetară - Dashboard Premium Consolidat Desktop".
 */

export type SummaryMetric = {
  label: string;
  value: string;
  /** Conținut opțional sub valoare — accent text sau bară de progres (vezi `SummaryProgressFooter`/`SummaryAccentFooter`). */
  footer?: React.ReactNode;
};

/** Un metric individual — etichetă, valoare mare mono, footer opțional. */
function MetricContent({ metric, compact }: { metric: SummaryMetric; compact?: boolean }) {
  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <p className="text-[10px] font-bold uppercase leading-tight tracking-widest opacity-70">
        {metric.label}
      </p>
      <span
        className={`block truncate font-mono font-bold tracking-tight ${
          compact ? "text-sm md:text-base lg:text-lg xl:text-2xl" : "text-base sm:text-lg"
        }`}
      >
        {metric.value}
      </span>
      {metric.footer}
    </div>
  );
}

/**
 * Un rând de metrici, cu linii despărțitoare verticale între ele — `divide-x` pe un flex cu coloane
 * egale (`flex-1`) garantează că linia cade exact la mijlocul spațiului dintre 2 metrici, indiferent
 * de conținut (spre deosebire de `border-r` + `gap`, care lasă linia decalată față de centru — bug-ul
 * semnalat: liniile „nu porneau din centru" pe rândurile cu 2 elemente). `compact` = varianta cu toate
 * metricile pe un singur rând (≥768px) — coloane mai multe și mai înguste, deci padding/font mai mici
 * ca textul (ex. „12.500 RON") să nu fie trunchiat la lățimi de tip „laptop" (768–1024px).
 */
function MetricRow({ metrics, compact }: { metrics: SummaryMetric[]; compact?: boolean }) {
  const padStart = compact ? "pl-3 lg:pl-6 xl:pl-8" : "pl-4 sm:pl-8";
  const padEnd = compact ? "pr-3 lg:pr-6 xl:pr-8" : "pr-4 sm:pr-8";
  return (
    <div className="flex divide-x divide-white/10">
      {metrics.map((metric, idx) => (
        <div
          key={metric.label}
          className={`min-w-0 flex-1 ${idx > 0 ? padStart : ""} ${idx < metrics.length - 1 ? padEnd : ""}`}
        >
          <MetricContent metric={metric} compact={compact} />
        </div>
      ))}
    </div>
  );
}

/** Împarte un array în perechi consecutive (ultimul grup poate avea un singur element). */
function chunkPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < items.length; i += 2) pairs.push(items.slice(i, i + 2));
  return pairs;
}

export default function DashboardSummaryCard({ metrics }: { metrics: SummaryMetric[] }) {
  // Pragul „desktop" al aplicației e 768px (regulă CLAUDE.md), nu 1024px — de-asta pragul de comutare
  // e `md`, nu `lg`: sub 768px randurile sunt perechi de 2, de la 768px în sus totul stă pe un rând.
  const pairs = chunkPairs(metrics);

  return (
    <div
      className="w-full overflow-hidden rounded-xl p-5 text-white shadow-md sm:p-6 lg:p-8"
      style={{ background: "linear-gradient(135deg, #1e293b 0%, #000000 100%)" }}
    >
      {/* <768px — perechi de câte 2 rânduri, separate printr-o linie orizontală (nu linii verticale
          „întrerupte" între rânduri, care arătau inconsecvent). */}
      <div className="flex flex-col gap-4 sm:gap-6 md:hidden">
        {pairs.map((pair, i) => (
          <div key={i} className={i > 0 ? "border-t border-white/10 pt-4 sm:pt-6" : ""}>
            <MetricRow metrics={pair} />
          </div>
        ))}
      </div>

      {/* ≥768px — toate metricile pe un singur rând, cu linii verticale corect centrate. */}
      <div className="hidden md:block">
        <MetricRow metrics={metrics} compact />
      </div>
    </div>
  );
}

/** Bară de progres subțire + procent, pt. footer-ul unui metric (ex: „63% din total utilizat"). */
export function SummaryProgressFooter({
  percent,
  color = "white",
}: {
  percent: number;
  color?: "white" | "secondary";
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${color === "white" ? "bg-white" : "bg-secondary"}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="shrink-0 font-mono text-[10px] opacity-60">{Math.round(clamped)}%</span>
    </div>
  );
}

/** Punct colorat + text mic, pt. footer-ul unui metric (ex: „71% disponibil"). */
export function SummaryAccentFooter({
  children,
  dotClassName = "bg-secondary",
  textClassName = "opacity-60",
}: {
  children: React.ReactNode;
  dotClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${dotClassName}`} />
      <span
        className={`text-[11px] font-medium uppercase leading-tight tracking-wider ${textClassName}`}
      >
        {children}
      </span>
    </div>
  );
}
