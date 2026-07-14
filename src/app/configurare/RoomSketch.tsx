import { Room } from "@/shared/types";
import { TECHNICAL_ICONS } from "@/shared/icons";
import { arcPath, buildRoomSketch, type Vec } from "./roomSketchGeometry";

/** Simbol de ușă standard: foaia deschisă perpendicular pe perete + arcul de deschidere. */
function DoorSymbol({ start, end, inward }: { start: Vec; end: Vec; inward: Vec }) {
  const r = Math.hypot(end.x - start.x, end.y - start.y);
  const tip = { x: start.x + inward.x * r, y: start.y + inward.y * r };
  return (
    <g className="text-secondary">
      <line x1={start.x} y1={start.y} x2={tip.x} y2={tip.y} stroke="currentColor" strokeWidth={1.25} />
      <path d={arcPath(start, tip, end)} fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="2.5 2" />
    </g>
  );
}

/** Simbol de fereastră: linie de geam pe traseul peretelui + mici repere de ramă la capete. */
function WindowSymbol({ start, end, inward }: { start: Vec; end: Vec; inward: Vec }) {
  const tick = 3;
  const p1a = { x: start.x + inward.x * tick, y: start.y + inward.y * tick };
  const p1b = { x: start.x - inward.x * tick, y: start.y - inward.y * tick };
  const p2a = { x: end.x + inward.x * tick, y: end.y + inward.y * tick };
  const p2b = { x: end.x - inward.x * tick, y: end.y - inward.y * tick };
  return (
    <g className="text-secondary">
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="currentColor" strokeWidth={2.5} />
      <line x1={p1a.x} y1={p1a.y} x2={p1b.x} y2={p1b.y} stroke="currentColor" strokeWidth={1} />
      <line x1={p2a.x} y1={p2a.y} x2={p2b.x} y2={p2b.y} stroke="currentColor" strokeWidth={1} />
    </g>
  );
}

/**
 * Schiță tehnică generată automat din configurarea camerei (draft-ul necomis din `RoomTechnicalCard`) —
 * patrulaterul camerei la scară (dreptunghi la Pătrat/Dreptunghi, formă liberă la „Neregulată”, cu un
 * perete real mai lung decât celelalte), cu uși/ferestre plasate pe peretele lor real. Fără pardoseală
 * completată, rămâne un placeholder text (nu e nimic de desenat încă). Geometria e calculată în
 * `roomSketchGeometry.ts`, partajată cu varianta PDF (`RoomSketchPdf.tsx`) — cele două rămân mereu identice.
 */
export default function RoomSketch({ room }: { room: Room }) {
  const sketch = buildRoomSketch(room);

  if (!sketch) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-line bg-surface-low p-4">
        <div className="text-center">
          <span className="material-symbols-outlined mb-2 text-4xl text-muted">
            {TECHNICAL_ICONS.blueprintPlaceholder}
          </span>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            Schiță Tehnică Generată
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-line bg-surface-low p-4">
      <svg viewBox={`0 0 ${sketch.viewW} ${sketch.viewH}`} className="w-full max-w-[260px]">
        {sketch.walls.map(({ wall, drawing }) => (
          <g key={wall}>
            {drawing.segments.map(([p1, p2], i) => (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="currentColor"
                strokeWidth={3.5}
                strokeLinecap="square"
                className="text-primary"
              />
            ))}
            {drawing.door && <DoorSymbol {...drawing.door} />}
            {drawing.window && <WindowSymbol {...drawing.window} />}
            <text
              x={drawing.label.pos.x}
              y={drawing.label.pos.y}
              textAnchor="middle"
              className="fill-muted font-mono"
              style={{ fontSize: 8 }}
            >
              {drawing.label.text}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
