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

/** Tailwind nu acceptă clase generate dinamic — mapăm explicit numărul de coloane la clasa `lg:grid-cols-*`. */
const COLUMNS_CLASS: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export default function DashboardSummaryCard({ metrics }: { metrics: SummaryMetric[] }) {
  const columnsClass = COLUMNS_CLASS[metrics.length] ?? "lg:grid-cols-4";

  return (
    <div
      className="w-full overflow-hidden rounded-xl p-6 text-white shadow-md sm:p-8"
      style={{ background: "linear-gradient(135deg, #1e293b 0%, #000000 100%)" }}
    >
      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 ${columnsClass}`}>
        {metrics.map((metric, idx) => (
          <div
            key={metric.label}
            className={`min-w-0 space-y-2 border-white/10 pr-4 ${idx < metrics.length - 1 ? "lg:border-r" : ""}`}
          >
            <p className="truncate text-[10px] font-bold uppercase tracking-widest opacity-70">
              {metric.label}
            </p>
            <span
              className="block truncate font-mono font-bold tracking-tight"
              style={{ fontSize: "clamp(16px, 1.6vw, 26px)" }}
            >
              {metric.value}
            </span>
            {metric.footer}
          </div>
        ))}
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
    <div className="flex items-center gap-2">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClassName}`} />
      <span
        className={`truncate text-[11px] font-medium uppercase tracking-wider ${textClassName}`}
      >
        {children}
      </span>
    </div>
  );
}
