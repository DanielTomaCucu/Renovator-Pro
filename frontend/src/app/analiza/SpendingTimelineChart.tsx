"use client";

import { useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { NormalizedTimelinePoint } from "@/shared/functions";
import { formatMonthLabel } from "./dates";

/** Padding vertical al viewBox-ului (0 0 800 200) — nu chiar marginile, ca liniile să nu atingă marginile. */
const PAD_TOP = 20;
const PAD_BOTTOM = 180;
const toScreenX = (x: number) => x * 800;
const toScreenY = (y: number) => PAD_BOTTOM - y * (PAD_BOTTOM - PAD_TOP);

/** Găsește punctul cel mai apropiat de o poziție orizontală fracționară (0–1) — folosit la „snap pe lună". */
function nearestIndex(points: NormalizedTimelinePoint[], fracX: number): number {
  let best = 0;
  let bestDist = Infinity;
  points.forEach((p, i) => {
    const d = Math.abs(p.x - fracX);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

/**
 * Grafic „Evoluția Cheltuielilor" — 2 linii pe aceeași axă: „Cheltuit cumulat" (principală, solidă,
 * proeminentă) și „Total cumulat" (secundară, punctată, mai puțin vizibilă — cumpărat + în așteptare).
 * Interactiv: mișcarea mouse-ului pe desktop (hover, fără click) SAU tragerea cu degetul pe mobil (touch)
 * folosesc ACELAȘI handler `onPointerMove` — evenimentele Pointer unifică cele două cazuri: pentru mouse
 * se declanșează la orice mișcare deasupra graficului, pentru touch doar cât timp degetul atinge ecranul
 * (echivalentul „hover" pe mobil e „glisează"). Linia verticală punctată face „snap" pe cea mai apropiată
 * lună (nu urmărește cursorul pixel cu pixel), cu un tooltip care arată ambele sume ale lunii respective.
 * Folosit identic pe desktop ȘI mobil (dimensiunea containerului părinte controlează mărimea).
 */
export default function SpendingTimelineChart({
  timeline,
  money,
}: {
  timeline: NormalizedTimelinePoint[];
  money: (value: number) => string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const linePath = useMemo(
    () =>
      timeline.length < 2
        ? ""
        : timeline.map((p, i) => `${i === 0 ? "M" : "L"}${toScreenX(p.x)},${toScreenY(p.ySpent)}`).join(" "),
    [timeline]
  );
  const areaPath = useMemo(() => {
    if (timeline.length < 2) return "";
    const first = timeline[0];
    const last = timeline[timeline.length - 1];
    return `${linePath} L${toScreenX(last.x)},200 L${toScreenX(first.x)},200 Z`;
  }, [timeline, linePath]);
  const totalLinePath = useMemo(
    () =>
      timeline.length < 2
        ? ""
        : timeline.map((p, i) => `${i === 0 ? "M" : "L"}${toScreenX(p.x)},${toScreenY(p.yTotal)}`).join(" "),
    [timeline]
  );

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fracX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHoverIndex(nearestIndex(timeline, fracX));
  }

  const hovered = hoverIndex !== null ? timeline[hoverIndex] : null;
  // Clamp orizontal ca tooltip-ul să nu iasă din card lângă margini (containerul e relativ, tooltip absolut).
  const tooltipLeftPct = hovered ? Math.min(92, Math.max(8, hovered.x * 100)) : 0;

  if (timeline.length === 0) return null;

  return (
    <div className="relative h-full w-full">
      <svg
        className="h-full w-full cursor-crosshair touch-none"
        preserveAspectRatio="none"
        viewBox="0 0 800 200"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
        onPointerUp={() => setHoverIndex(null)}
        onPointerCancel={() => setHoverIndex(null)}
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

        {/* Linia verticală de „snap" pe luna curentă hover/tap — sub linii, deasupra gridului. */}
        {hovered && (
          <line
            x1={toScreenX(hovered.x)}
            x2={toScreenX(hovered.x)}
            y1={PAD_TOP - 10}
            y2="200"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        )}

        {timeline.length === 1 ? (
          <>
            <circle cx="400" cy={toScreenY(timeline[0].yTotal)} r="4" fill="#cbd5e1" />
            <circle cx="400" cy={toScreenY(timeline[0].ySpent)} r="5" fill="#000000" />
          </>
        ) : (
          <>
            {/* Total — secundară, punctată, sub linia principală (mai puțin vizibilă). */}
            <path d={totalLinePath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 5" opacity="0.7" />
            {/* Cheltuit — principală, solidă, cu arie sub curbă. */}
            <path d={areaPath} fill="url(#expense-gradient)" />
            <path d={linePath} fill="none" stroke="#000000" strokeWidth="3" />
          </>
        )}

        {hovered && (
          <>
            <circle cx={toScreenX(hovered.x)} cy={toScreenY(hovered.yTotal)} r="4" fill="#94a3b8" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx={toScreenX(hovered.x)} cy={toScreenY(hovered.ySpent)} r="6" fill="#000000" stroke="#ffffff" strokeWidth="2" />
          </>
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-white shadow-lg"
          style={{ left: `${tooltipLeftPct}%`, top: `${(toScreenY(hovered.ySpent) / 200) * 100}%` }}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-70">{formatMonthLabel(hovered.month)}</div>
          <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[13px] font-bold">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
            {money(hovered.cumulativeSpent)}
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/60">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/50" />
            {money(hovered.cumulativeTotal)}
          </div>
        </div>
      )}
    </div>
  );
}
