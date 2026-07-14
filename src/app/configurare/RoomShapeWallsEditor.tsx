import { RoomShape, Wall } from "@/shared/types";
import { TECHNICAL_ICONS } from "@/shared/icons";
import { IconSelectField, WALL_LABELS, labelCls, inputCls } from "./RoomTechnicalCard";

const walls = Object.values(Wall);

const shapeOptions = [
  { value: RoomShape.Patrat, label: "Pătrat", icon: TECHNICAL_ICONS.shapeSquare },
  { value: RoomShape.Dreptunghi, label: "Dreptunghi", icon: TECHNICAL_ICONS.shapeRectangle },
  { value: RoomShape.Neregulata, label: "Formă neregulată", icon: TECHNICAL_ICONS.shapeIrregular },
];

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Calculele + handlerele de schimbare a lungimilor de perete, comune între selectorul de formă și
 * inputurile specifice formei (separate în 2 componente ca să poată sta în locuri diferite din grid).
 * La Pătrat/Dreptunghi, suprafața rezultată din dimensiuni e limitată să nu depășească `floorArea`
 * (suprafața introdusă la Pardoseală) — altfel schița și necesarul de faianță/plintă ar diverge silențios
 * de mp-ii reali ai camerei.
 */
function useShapeHandlers(wallLengths: Record<Wall, number>, floorArea: number | undefined, onChangeLengths: (l: Record<Wall, number>) => void) {
  const maxSide = floorArea && floorArea > 0 ? round2(Math.sqrt(floorArea)) : undefined;
  const side = wallLengths[Wall.Nord] || 0;
  const lungime = wallLengths[Wall.Nord] || 0;
  const latime = wallLengths[Wall.Est] || 0;

  const changeSide = (value: number) => {
    const clamped = maxSide ? Math.min(value, maxSide) : value;
    onChangeLengths({
      [Wall.Nord]: clamped,
      [Wall.Sud]: clamped,
      [Wall.Est]: clamped,
      [Wall.Vest]: clamped,
    });
  };

  const changeLungime = (value: number) => {
    const l = floorArea && floorArea > 0 && latime > 0 && value * latime > floorArea
      ? round2(floorArea / latime)
      : value;
    onChangeLengths({ [Wall.Nord]: l, [Wall.Sud]: l, [Wall.Est]: latime, [Wall.Vest]: latime });
  };

  const changeLatime = (value: number) => {
    const la = floorArea && floorArea > 0 && lungime > 0 && lungime * value > floorArea
      ? round2(floorArea / lungime)
      : value;
    onChangeLengths({ [Wall.Nord]: lungime, [Wall.Sud]: lungime, [Wall.Est]: la, [Wall.Vest]: la });
  };

  return { maxSide, side, lungime, latime, changeSide, changeLungime, changeLatime };
}

/**
 * Doar select-ul „Formă cameră" — plasat de apelant oriunde e nevoie în grid (ex. lângă „Înălțime
 * Placare"/„Înălțime Pereți"), separat de inputurile de dimensiuni (`RoomShapeLengthInputs`) care merg
 * pe rândul următor, pe toată lățimea cardului.
 */
export function RoomShapeSelect({
  shape,
  wallLengths,
  floorArea,
  onChangeShape,
  onChangeLengths,
  wrapperClassName,
}: {
  shape: RoomShape | undefined;
  wallLengths: Record<Wall, number>;
  floorArea?: number;
  onChangeShape: (shape: RoomShape) => void;
  onChangeLengths: (lengths: Record<Wall, number>) => void;
  wrapperClassName?: string;
}) {
  const { side, lungime, latime, changeSide, changeLungime } = useShapeHandlers(
    wallLengths,
    floorArea,
    onChangeLengths
  );

  // La schimbarea formei, valorile existente se renormalizează imediat (nu doar la următoarea editare) —
  // altfel schița rămâne cu vechea formă (ex. dreptunghi) până userul reatinge manual un input.
  const changeShape = (newShape: RoomShape) => {
    onChangeShape(newShape);
    if (newShape === RoomShape.Patrat) {
      changeSide(side || latime || 0);
    } else if (newShape === RoomShape.Dreptunghi) {
      changeLungime(lungime || 0);
    }
  };

  return (
    <IconSelectField
      label="Formă cameră"
      value={shape ?? ""}
      onChange={(v) => v && changeShape(v as RoomShape)}
      options={shapeOptions}
      placeholder="— Alege forma camerei —"
      wrapperClassName={wrapperClassName}
    />
  );
}

/**
 * Inputurile de lungime specifice formei alese — 1 pt. Pătrat, 2 pt. Dreptunghi (full width, pe tot
 * lățimea cardului), 4 pt. formă neregulată. Fără formă aleasă, arată doar un mesaj (nu inputuri).
 */
export function RoomShapeLengthInputs({
  shape,
  wallLengths,
  floorArea,
  onChangeLengths,
}: {
  shape: RoomShape | undefined;
  wallLengths: Record<Wall, number>;
  floorArea?: number;
  onChangeLengths: (lengths: Record<Wall, number>) => void;
}) {
  const { maxSide, side, lungime, latime, changeSide, changeLungime, changeLatime } = useShapeHandlers(
    wallLengths,
    floorArea,
    onChangeLengths
  );

  if (!shape) {
    return (
      <p className="text-[10px] italic text-muted">
        Alege forma camerei ca să știi câte dimensiuni de perete trebuie completate.
      </p>
    );
  }

  if (shape === RoomShape.Patrat) {
    return (
      <div className="max-w-xs space-y-1">
        <label className="space-y-1">
          <span className={labelCls}>Latura camerei (m)</span>
          <input
            type="number"
            step="0.01"
            min={0}
            max={maxSide}
            placeholder="ex: 2.40"
            className={inputCls}
            value={side || ""}
            onChange={(e) => changeSide(Number(e.target.value) || 0)}
          />
        </label>
        {maxSide &&
          (side >= maxSide - 0.005 ? (
            <p className="flex items-center gap-1 text-[10px] font-bold text-tertiary">
              <span className="material-symbols-outlined text-xs">warning</span>
              Ai atins maximul — suprafața pereților ({round2(side * side).toFixed(2)} mp) nu poate
              depăși pardoseala ({floorArea!.toFixed(2)} mp).
            </p>
          ) : (
            <p className="text-[10px] italic text-muted">
              Max {maxSide.toFixed(2)} m, ca suprafața pereților să nu depășească pardoseala (
              {floorArea!.toFixed(2)} mp).
            </p>
          ))}
      </div>
    );
  }

  if (shape === RoomShape.Dreptunghi) {
    return (
      <div className="space-y-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className={labelCls}>Lungime N–S (m)</span>
            <input
              type="number"
              step="0.01"
              min={0}
              placeholder="ex: 3.00"
              className={inputCls}
              value={lungime || ""}
              onChange={(e) => changeLungime(Number(e.target.value) || 0)}
            />
          </label>
          <label className="space-y-1">
            <span className={labelCls}>Lățime E–V (m)</span>
            <input
              type="number"
              step="0.01"
              min={0}
              placeholder="ex: 2.20"
              className={inputCls}
              value={latime || ""}
              onChange={(e) => changeLatime(Number(e.target.value) || 0)}
            />
          </label>
        </div>
        {!!floorArea &&
          (lungime * latime >= floorArea - 0.005 && lungime > 0 && latime > 0 ? (
            <p className="flex items-center gap-1 text-[10px] font-bold text-tertiary">
              <span className="material-symbols-outlined text-xs">warning</span>
              Ai atins maximul — suprafața rezultată ({round2(lungime * latime).toFixed(2)} mp) nu
              poate depăși pardoseala ({floorArea.toFixed(2)} mp).
            </p>
          ) : (
            <p className="text-[10px] italic text-muted">
              Suprafața rezultată (lungime × lățime) nu poate depăși {floorArea.toFixed(2)} mp
              (suprafața pardoselii).
            </p>
          ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {walls.map((w) => (
        <label key={w} className="space-y-1">
          <span className={labelCls}>{WALL_LABELS[w]} — Lungime (m)</span>
          <input
            type="number"
            step="0.01"
            min={0}
            placeholder="ex: 2.25"
            className={inputCls}
            value={wallLengths[w] || ""}
            onChange={(e) => onChangeLengths({ ...wallLengths, [w]: Number(e.target.value) || 0 })}
          />
        </label>
      ))}
    </div>
  );
}
