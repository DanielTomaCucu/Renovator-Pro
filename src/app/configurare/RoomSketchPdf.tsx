import { Svg, Line, Path, Text as PdfText, G } from "@react-pdf/renderer";
import { Room } from "@/shared/types";
import { arcPath, buildRoomSketch, type Vec } from "./roomSketchGeometry";

const COLOR_PRIMARY = "#000000";
const COLOR_SECONDARY = "#0ea5e9";
const COLOR_MUTED = "#64748b";

function DoorSymbolPdf({ start, end, inward }: { start: Vec; end: Vec; inward: Vec }) {
  const r = Math.hypot(end.x - start.x, end.y - start.y);
  const tip = { x: start.x + inward.x * r, y: start.y + inward.y * r };
  return (
    <G>
      <Line x1={start.x} y1={start.y} x2={tip.x} y2={tip.y} stroke={COLOR_SECONDARY} strokeWidth={1.25} />
      <Path
        d={arcPath(start, tip, end)}
        fill="none"
        stroke={COLOR_SECONDARY}
        strokeWidth={1}
        strokeDasharray="2.5,2"
      />
    </G>
  );
}

function WindowSymbolPdf({ start, end, inward }: { start: Vec; end: Vec; inward: Vec }) {
  const tick = 3;
  const p1a = { x: start.x + inward.x * tick, y: start.y + inward.y * tick };
  const p1b = { x: start.x - inward.x * tick, y: start.y - inward.y * tick };
  const p2a = { x: end.x + inward.x * tick, y: end.y + inward.y * tick };
  const p2b = { x: end.x - inward.x * tick, y: end.y - inward.y * tick };
  return (
    <G>
      <Line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={COLOR_SECONDARY} strokeWidth={2.5} />
      <Line x1={p1a.x} y1={p1a.y} x2={p1b.x} y2={p1b.y} stroke={COLOR_SECONDARY} strokeWidth={1} />
      <Line x1={p2a.x} y1={p2a.y} x2={p2b.x} y2={p2b.y} stroke={COLOR_SECONDARY} strokeWidth={1} />
    </G>
  );
}

/**
 * Aceeași schiță tehnică ca `RoomSketch.tsx`, dar randată cu primitivele `@react-pdf/renderer` (nu
 * DOM `<svg>`) — geometria vine din `roomSketchGeometry.ts`, identică în ambele locuri. `null` dacă nu
 * există date de pardoseală suficiente (apelantul decide ce afișează în locul ei, în PDF).
 */
export default function RoomSketchPdf({ room }: { room: Room }) {
  const sketch = buildRoomSketch(room, 260, 200, 22);
  if (!sketch) return null;

  return (
    <Svg viewBox={`0 0 ${sketch.viewW} ${sketch.viewH}`} style={{ width: 260, height: 200 }}>
      {sketch.walls.map(({ wall, drawing }) => (
        <G key={wall}>
          {drawing.segments.map(([p1, p2], i) => (
            <Line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={COLOR_PRIMARY}
              strokeWidth={3.5}
              strokeLinecap="square"
            />
          ))}
          {drawing.door && <DoorSymbolPdf {...drawing.door} />}
          {drawing.window && <WindowSymbolPdf {...drawing.window} />}
          <PdfText
            x={drawing.label.pos.x}
            y={drawing.label.pos.y}
            fill={COLOR_MUTED}
            textAnchor="middle"
            style={{ fontSize: 8, fontFamily: "Inter" }}
          >
            {drawing.label.text}
          </PdfText>
        </G>
      ))}
    </Svg>
  );
}
