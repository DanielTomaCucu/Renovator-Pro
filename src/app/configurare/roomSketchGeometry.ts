import { Room, Wall } from "@/shared/types";

export type Vec = { x: number; y: number };
type Corners = { tl: Vec; tr: Vec; bl: Vec; br: Vec };

export type WallDrawing = {
  segments: [Vec, Vec][];
  door?: { start: Vec; end: Vec; inward: Vec };
  window?: { start: Vec; end: Vec; inward: Vec };
  label: { pos: Vec; text: string };
};

export type RoomSketchData = {
  viewW: number;
  viewH: number;
  walls: { wall: Wall; drawing: WallDrawing }[];
};

/**
 * Geometria schiței tehnice a unei camere — logică pură (fără JSX), partajată între randarea din
 * browser (`RoomSketch.tsx`, tag-uri `<svg>` native) și cea din PDF-ul exportat (`RoomSketchPdf.tsx`,
 * componentele `@react-pdf/renderer`) — ca cele două schițe să fie mereu identice, calculate o singură
 * dată. Vezi `RoomSketch.tsx` pentru explicația geometriei patrulaterului (nu presupune dreptunghi).
 */
function roomQuad(room: Room): { corners: Corners; edgeLenM: Record<Wall, number> } | null {
  const wallLengths = room.wallTiling?.wallLengths ?? room.wallFinish?.wallLengths;
  let Wt = wallLengths?.[Wall.Nord];
  let Wb = wallLengths?.[Wall.Sud];
  let Ls = wallLengths?.[Wall.Vest];
  let Rs = wallLengths?.[Wall.Est];

  if (!Wt || !Wb || !Ls || !Rs) {
    const area = room.floorArea;
    const perimeter = room.perimeter;
    let width: number | undefined;
    let height: number | undefined;
    if (area && perimeter) {
      const halfPerimeter = perimeter / 2;
      const discriminant = halfPerimeter * halfPerimeter - 4 * area;
      if (discriminant >= 0) {
        const root = Math.sqrt(discriminant);
        width = (halfPerimeter + root) / 2;
        height = (halfPerimeter - root) / 2;
      }
    }
    if ((!width || !height) && area && area > 0) {
      width = height = Math.sqrt(area);
    }
    if (!width || !height) return null;
    Wt = Wb = width;
    Ls = Rs = height;
  }

  const k = Wt - Wb;
  let dx: number;
  let h: number;
  if (Math.abs(k) < 1e-6) {
    dx = 0;
    h = Math.abs(Ls - Rs) < 1e-6 ? Ls : (Ls + Rs) / 2;
  } else {
    dx = (Rs * Rs - Ls * Ls - k * k) / (2 * k);
    const h2 = Ls * Ls - dx * dx;
    if (h2 > 0) {
      h = Math.sqrt(h2);
    } else {
      dx = 0;
      h = (Ls + Rs) / 2;
    }
  }
  if (!isFinite(h) || h <= 0) h = (Ls + Rs) / 2 || Wt || 1;

  const corners: Corners = {
    tl: { x: dx, y: 0 },
    tr: { x: dx + Wt, y: 0 },
    bl: { x: 0, y: h },
    br: { x: Wb, y: h },
  };

  return { corners, edgeLenM: { [Wall.Nord]: Wt, [Wall.Sud]: Wb, [Wall.Vest]: Ls, [Wall.Est]: Rs } };
}

/** Traseu de arc (aproximat prin puncte) de la `from` la `to`, pe cercul de rază fixă centrat în `center`. */
export function arcPath(center: Vec, from: Vec, to: Vec, steps = 14): string {
  const r = Math.hypot(from.x - center.x, from.y - center.y);
  const a0 = Math.atan2(from.y - center.y, from.x - center.x);
  const a1 = Math.atan2(to.y - center.y, to.x - center.x);
  let diff = a1 - a0;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + (diff * i) / steps;
    points.push(`${(center.x + r * Math.cos(a)).toFixed(2)},${(center.y + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M ${points.join(" L ")}`;
}

function inwardDirection(start: Vec, end: Vec, centroid: Vec): Vec {
  const v = { x: end.x - start.x, y: end.y - start.y };
  const len = Math.hypot(v.x, v.y) || 1;
  const n = { x: -v.y / len, y: v.x / len };
  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const toCentroid = { x: centroid.x - mid.x, y: centroid.y - mid.y };
  const dot = n.x * toCentroid.x + n.y * toCentroid.y;
  return dot >= 0 ? n : { x: -n.x, y: -n.y };
}

const WALL_EDGES: Record<Wall, (c: Corners) => [Vec, Vec]> = {
  [Wall.Nord]: (c) => [c.tl, c.tr],
  [Wall.Sud]: (c) => [c.bl, c.br],
  [Wall.Vest]: (c) => [c.tl, c.bl],
  [Wall.Est]: (c) => [c.tr, c.br],
};

function wallDrawing(room: Room, wall: Wall, start: Vec, end: Vec, lengthM: number, centroid: Vec): WallDrawing {
  const lengthPx = Math.hypot(end.x - start.x, end.y - start.y);
  const dir = { x: (end.x - start.x) / (lengthPx || 1), y: (end.y - start.y) / (lengthPx || 1) };
  const inward = inwardDirection(start, end, centroid);
  const pointAt = (t: number): Vec => ({ x: start.x + dir.x * t, y: start.y + dir.y * t });

  const door = room.doors?.[wall];
  const win = room.windows?.[wall];
  const elements: { type: "door" | "window"; widthM: number; centerFrac: number }[] = [];
  if (door && win) {
    elements.push({ type: "door", widthM: door.width, centerFrac: 0.32 });
    elements.push({ type: "window", widthM: win.width, centerFrac: 0.72 });
  } else if (door) {
    elements.push({ type: "door", widthM: door.width, centerFrac: 0.5 });
  } else if (win) {
    elements.push({ type: "window", widthM: win.width, centerFrac: 0.5 });
  }

  const openings = elements
    .map((el) => {
      const centerPx = el.centerFrac * lengthPx;
      const halfPx = Math.min(
        lengthPx * 0.4,
        Math.max(6, ((el.widthM > 0 ? el.widthM : 0.8) / Math.max(lengthM, 0.1) / 2) * lengthPx)
      );
      return {
        ...el,
        startPx: Math.max(4, centerPx - halfPx),
        endPx: Math.min(lengthPx - 4, centerPx + halfPx),
      };
    })
    .sort((a, b) => a.startPx - b.startPx);

  const segments: [Vec, Vec][] = [];
  let cursor = 0;
  for (const o of openings) {
    if (o.startPx > cursor) segments.push([pointAt(cursor), pointAt(o.startPx)]);
    cursor = Math.max(cursor, o.endPx);
  }
  if (cursor < lengthPx) segments.push([pointAt(cursor), pointAt(lengthPx)]);

  let door_: WallDrawing["door"];
  let window_: WallDrawing["window"];
  for (const o of openings) {
    const sym = { start: pointAt(o.startPx), end: pointAt(o.endPx), inward };
    if (o.type === "door") door_ = sym;
    else window_ = sym;
  }

  const mid = pointAt(lengthPx / 2);
  const labelPos = { x: mid.x + inward.x * -12, y: mid.y + inward.y * -12 };

  return { segments, door: door_, window: window_, label: { pos: labelPos, text: `${lengthM.toFixed(2)} m` } };
}

/**
 * Calculează schița completă a camerei (patrulater + uși/ferestre + etichete), gata de randat — fie cu
 * `<svg>` nativ (browser), fie cu componentele `@react-pdf/renderer` (PDF export). `null` dacă nu există
 * încă date de pardoseală suficiente pentru a desena ceva.
 */
export function buildRoomSketch(room: Room, viewW = 260, viewH = 210, pad = 26): RoomSketchData | null {
  const quad = roomQuad(room);
  if (!quad) return null;

  const { corners, edgeLenM } = quad;
  const xs = [corners.tl.x, corners.tr.x, corners.bl.x, corners.br.x];
  const ys = [corners.tl.y, corners.tr.y, corners.bl.y, corners.br.y];
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const bboxW = xMax - xMin || 1;
  const bboxH = yMax - yMin || 1;

  const availW = viewW - pad * 2;
  const availH = viewH - pad * 2;
  const scale = Math.min(availW / bboxW, availH / bboxH);
  const offsetX = (viewW - bboxW * scale) / 2;
  const offsetY = (viewH - bboxH * scale) / 2;

  const toSvg = (p: Vec): Vec => ({
    x: offsetX + (p.x - xMin) * scale,
    y: offsetY + (p.y - yMin) * scale,
  });

  const svgCorners: Corners = {
    tl: toSvg(corners.tl),
    tr: toSvg(corners.tr),
    bl: toSvg(corners.bl),
    br: toSvg(corners.br),
  };
  const centroid = {
    x: (svgCorners.tl.x + svgCorners.tr.x + svgCorners.bl.x + svgCorners.br.x) / 4,
    y: (svgCorners.tl.y + svgCorners.tr.y + svgCorners.bl.y + svgCorners.br.y) / 4,
  };

  const walls = Object.values(Wall).map((wall) => {
    const [start, end] = WALL_EDGES[wall](svgCorners);
    return { wall, drawing: wallDrawing(room, wall, start, end, edgeLenM[wall], centroid) };
  });

  return { viewW, viewH, walls };
}
