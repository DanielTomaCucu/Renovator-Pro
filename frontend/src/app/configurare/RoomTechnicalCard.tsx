"use client";

import { useEffect, useRef, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import {
  FlooringType,
  InstallationType,
  Room,
  RoomShape,
  RoomType,
  TileSize,
  Wall,
  WallFinishType,
} from "@/shared/types";
import { useStore } from "@/shared/store";
import { useAsyncAction } from "@/shared/useAsyncAction";
import {
  ACTION_ICONS,
  FLOORING_TYPE_ICONS,
  INSTALLATION_TYPE_ICONS,
  ROOM_TYPE_ICONS,
  TECHNICAL_ICONS,
  TILE_SIZE_ICONS,
} from "@/shared/icons";
import ConfirmDialog from "@/components/ConfirmDialog";
import Spinner from "@/components/Spinner";
import RoomSketch from "./RoomSketch";
import { RoomShapeSelect, RoomShapeLengthInputs } from "./RoomShapeWallsEditor";
import { buildRoomCalcRows } from "./roomCalcRows";
import { computeRoomDimensions, estimatedSquareWallSide, hasFloorConfig } from "@/shared/functions";

const floorMaterials = Object.values(FlooringType);
const tileSizes = Object.values(TileSize);
const installationTypes = Object.values(InstallationType);
const walls = Object.values(Wall);
const wallFinishTypes = Object.values(WallFinishType);

const floorMaterialOptions = floorMaterials.map((m) => ({
  value: m,
  label: m,
  icon: FLOORING_TYPE_ICONS[m],
}));
const tileSizeOptions = tileSizes.map((s) => ({ value: s, label: s, icon: TILE_SIZE_ICONS[s] }));
const installationTypeOptions = installationTypes.map((t) => ({
  value: t,
  label: t,
  icon: INSTALLATION_TYPE_ICONS[t],
}));

/** Nume complet per perete — afișat în loc de codul cu o literă (N/E/S/V), mai clar pt. userul final. */
export const WALL_LABELS: Record<Wall, string> = {
  [Wall.Nord]: "Nord",
  [Wall.Est]: "Est",
  [Wall.Sud]: "Sud",
  [Wall.Vest]: "Vest",
};

/** Descriere scurtă per tip de cameră — afișată sub numele camerei în card. */
export const ROOM_TYPE_DESCRIPTION: Record<RoomType, string> = {
  [RoomType.Dormitor]: "Zona de odihnă",
  [RoomType.Baie]: "Zona umedă",
  [RoomType.Living]: "Zona de zi",
  [RoomType.Bucatarie]: "Zona de gătit",
  [RoomType.Terasa]: "Zonă exterioară",
  [RoomType.Balcon]: "Zonă exterioară",
};

const selectCls =
  "w-full appearance-none rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";
export const inputCls =
  "w-full rounded-lg border border-line bg-surface px-4 py-3 font-mono text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";
export const labelCls = "block text-[10px] font-bold uppercase text-muted";

/** Select cu iconiță chevron custom — distinge vizual selectoarele de inputurile numerice. */
function SelectField({
  label,
  wrapperClassName,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; wrapperClassName?: string }) {
  return (
    <label className={`space-y-1 ${wrapperClassName ?? ""}`}>
      <span className={labelCls}>{label}</span>
      <div className="relative">
        <select className={selectCls} {...props}>
          {children}
        </select>
        <span className="material-symbols-outlined icon-btn pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
          {ACTION_ICONS.expandMore}
        </span>
      </div>
    </label>
  );
}

/**
 * Select custom cu iconiță per opțiune (native `<option>` nu poate reda iconițe) — buton care deschide
 * o listă simplă cu iconiță + text pe fiecare rând, mai vizual decât un `<select>` simplu de text.
 * Lista se randează într-un portal pe `document.body`, poziționată `fixed` după coordonatele reale ale
 * butonului — altfel un ancestor cu `overflow-hidden` (cardul camerei, secțiunea colapsabilă) ar tăia
 * dropdown-ul quando depășește înălțimea vizibilă a cardului. Înălțimea proprie e limitată + scroll
 * intern, ca lista să rămână complet accesibilă chiar dacă are mai multe opțiuni decât încap pe ecran.
 * Cât timp e deschis, poziția se recalculează la fiecare scroll/resize (capture:true, ca să prindă și
 * scroll-ul din containere interne, nu doar window) — altfel un scroll cu dropdown-ul deschis îl lăsa
 * „înghețat" la coordonatele inițiale, deconectat vizual de buton.
 */
export function IconSelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder = "— Alege —",
  wrapperClassName,
}: {
  label: string;
  value: T | "";
  onChange: (value: T | "") => void;
  options: { value: T; label: string; icon: string }[];
  placeholder?: string;
  wrapperClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const current = options.find((o) => o.value === value);

  const updateRect = () => {
    if (!buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    setRect({ top: r.bottom + 4, left: r.left, width: r.width });
  };

  const toggleOpen = () => {
    if (!open) updateRect();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updateRect, { capture: true, passive: true });
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, { capture: true });
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  return (
    <div className={`space-y-1 ${wrapperClassName ?? ""}`}>
      <span className={labelCls}>{label}</span>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className={`${selectCls} flex items-center gap-2 text-left`}
      >
        {current ? (
          <>
            <span className="material-symbols-outlined shrink-0 text-lg text-secondary">
              {current.icon}
            </span>
            <span className="min-w-0 flex-1 truncate">{current.label}</span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-muted">{placeholder}</span>
        )}
        <span className="material-symbols-outlined icon-btn ml-auto shrink-0 text-muted">
          {ACTION_ICONS.expandMore}
        </span>
      </button>
      {open &&
        rect &&
        createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div
              style={{ top: rect.top, left: rect.left, width: rect.width }}
              className="fixed z-50 max-h-64 overflow-y-auto rounded-lg border border-line bg-surface shadow-lg"
            >
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-muted hover:bg-surface-low"
              >
                {placeholder}
              </button>
              {options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-surface-low ${
                    o.value === value ? "bg-secondary/10 font-semibold text-secondary" : ""
                  }`}
                >
                  <span className="material-symbols-outlined shrink-0 text-lg">{o.icon}</span>
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

/** Sub-secțiune colapsabilă în corpul unui card de cameră (accordion `<details>` controlat), numerotată. */
function TechnicalSection({
  number,
  icon,
  title,
  action,
  open,
  onToggle,
  children,
}: {
  number: number;
  icon: string;
  title: string;
  action?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <details open={open} className="group/section overflow-hidden rounded-xl border border-line/50">
      <summary
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
        className="flex cursor-pointer list-none items-center justify-between border-b border-line bg-surface p-4"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="material-symbols-outlined shrink-0 text-primary">{icon}</span>
          <h5 className="truncate text-xs font-bold uppercase tracking-wider text-primary">
            {number}. {title}
          </h5>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {action}
          <span className="material-symbols-outlined text-muted transition-transform group-open/section:rotate-180">
            {ACTION_ICONS.expandMore}
          </span>
        </div>
      </summary>
      <div className="space-y-6 bg-background p-3 sm:p-6">{children}</div>
    </details>
  );
}

function ResultRow({
  label,
  value,
  formula,
  math,
}: {
  label: string;
  value: string;
  formula: string;
  math: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-mono font-bold">{value}</span>
      </div>
      <div className="rounded border border-line bg-surface-low p-1.5 font-mono text-[10px] text-muted">
        Formulă: {formula}
        <br />
        Calcul: {math}
      </div>
    </div>
  );
}

export default function RoomTechnicalCard({ room }: { room: Room }) {
  const { updateRoom, deleteRoom } = useStore();
  // Cardul pornește ÎNTOTDEAUNA închis (la montare/revenire pe pagină) — cu toate cardurile deschise
  // odată, pagina devine ilizibilă/greu de navigat cu mai multe camere. Userul deschide explicit doar
  // camera la care lucrează.
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Draft local — toate editările din card scriu aici, NU direct în store. Nimic nu se propagă către
  // celelalte pagini/calcule globale până la apăsarea explicită a „Salvează" (buton la finalul cardului).
  const [draft, setDraft] = useState<Room>(room);
  // Secțiunile interne (Pardoseală/Pereți/Ferestre/Uși) pornesc și ele închise — aceeași motivație ca
  // mai sus: la deschiderea cardului, vrem o listă compactă de secțiuni, nu totul expandat deodată.
  const [sectionsOpen, setSectionsOpen] = useState({
    floor: false,
    walls: false,
    windows: false,
    doors: false,
  });
  const toggleSection = (key: keyof typeof sectionsOpen) =>
    setSectionsOpen((s) => ({ ...s, [key]: !s[key] }));

  // Flag din header: DERIVAT direct din `room` (datele reale de pe server), nu dintr-un state efemeră
  // de sesiune — așa se menține corect și după ce userul navighează la altă pagină și se întoarce
  // (componenta se remontează, dar `room` vine proaspăt din store): cameră deja configurată → bifă
  // verde; cameră fără configurare tehnică încă → indicator neutru (gri), ca userul să vadă dintr-o
  // privire, cu cardul închis, care cameră mai are de lucru.
  const isConfigured = hasFloorConfig(room);

  // Indicator subtil în header: bifă verde imediat după „Salvează", ascunsă imediat ce draftul
  // diverge din nou de ce e în store — ca userul să vadă rapid la care camere a lucrat deja.
  const [saved, setSaved] = useState(false);

  const patch = (p: Partial<Room>) => {
    setDraft((prev) => ({ ...prev, ...p }));
    setSaved(false);
  };

  const { run: handleSave, pending: savePending } = useAsyncAction(async () => {
    // Câmpurile tehnice opționale trimit explicit `null` când sunt dezactivate în draft (nu `undefined`,
    // care JSON.stringify-uiește ca „cheie absentă" = „nu se modifică" pe backend) — altfel dezactivarea
    // placării/finisajului sau golirea suprafeței pardoselii nu s-ar persista (Problema 6 din audit).
    await updateRoom(room.id, {
      ...draft,
      floorMaterial: draft.floorMaterial ?? null,
      floorArea: draft.floorArea ?? null,
      perimeter: draft.perimeter ?? null,
      tileSize: draft.tileSize ?? null,
      installationType: draft.installationType ?? null,
      baseboardHeight: draft.baseboardHeight ?? null,
      wallShape: draft.wallShape ?? null,
      wallTiling: draft.wallTiling ?? null,
      wallFinish: draft.wallFinish ?? null,
    });
    setOpen(false);
    setSectionsOpen({ floor: false, walls: false, windows: false, doors: false });
    setSaved(true);
  });

  // Faianța (wallTiling) e disponibilă doar la Gresie — la Parchet/Mochetă alternativa e vopsea/tapet (wallFinish).
  const isGresie = draft.floorMaterial === FlooringType.Gresie;
  const wallTilingEnabled = isGresie && !!draft.wallTiling;
  const wallFinishEnabled = !isGresie && !!draft.wallFinish;

  // Pornim pereții de la o lungime estimată (√suprafață, adică am presupune camera pătrată), ca userul
  // să nu completeze de la 0 fiecare perete — rămâne complet editabilă după activare, nu se resincronizează.
  const estimatedSide = Number(estimatedSquareWallSide(draft).toFixed(2));

  // Înălțime implicită la activare — camera standard are ~2.5m; 0 ar produce silențios o arie de 0mp
  // (lungime × 0), dând impresia falsă că „datele de la pereți nu contează" (Problema 7 din audit).
  const DEFAULT_WALL_HEIGHT = 2.5;

  const toggleWallTiling = () => {
    if (wallTilingEnabled) {
      patch({ wallTiling: undefined });
    } else {
      patch({
        wallShape: draft.wallShape ?? RoomShape.Patrat,
        wallTiling: {
          tiledWallsCount: 4,
          tileHeight: DEFAULT_WALL_HEIGHT,
          wallLengths: {
            [Wall.Nord]: estimatedSide,
            [Wall.Est]: estimatedSide,
            [Wall.Sud]: estimatedSide,
            [Wall.Vest]: estimatedSide,
          },
        },
      });
    }
  };

  const toggleWallFinish = () => {
    if (wallFinishEnabled) {
      patch({ wallFinish: undefined });
    } else {
      patch({
        wallShape: draft.wallShape ?? RoomShape.Patrat,
        wallFinish: {
          wallHeight: DEFAULT_WALL_HEIGHT,
          wallLengths: {
            [Wall.Nord]: estimatedSide,
            [Wall.Est]: estimatedSide,
            [Wall.Sud]: estimatedSide,
            [Wall.Vest]: estimatedSide,
          },
          finishes: {},
        },
      });
    }
  };

  // Fereastră — max. 1 per perete, indiferent de tipul de pardoseală. Reprezentate ca o listă de
  // ferestre (perete + dimensiuni), nu ca 4 sloturi fixe — mai puțin aglomerat, mai mult spațiu per câmp.
  const windowEntries = walls
    .filter((w) => draft.windows?.[w])
    .map((w) => [w, draft.windows![w]!] as const);
  const availableWalls = walls.filter((w) => !draft.windows?.[w]);

  const addWindow = () => {
    const nextWall = availableWalls[0];
    if (!nextWall) return;
    patch({ windows: { ...draft.windows, [nextWall]: { width: 0, height: 0 } } });
  };

  const removeWindow = (wall: Wall) => {
    const windows = { ...draft.windows };
    delete windows[wall];
    patch({ windows });
  };

  const removeAllWindows = () => patch({ windows: {} });

  const changeWindowWall = (oldWall: Wall, newWall: Wall) => {
    if (oldWall === newWall) return;
    const current = draft.windows?.[oldWall];
    if (!current) return;
    const windows = { ...draft.windows };
    delete windows[oldWall];
    windows[newWall] = current;
    patch({ windows });
  };

  const updateWindow = (wall: Wall, patchWindow: Partial<{ width: number; height: number }>) => {
    const current = draft.windows?.[wall];
    if (!current) return;
    patch({ windows: { ...draft.windows, [wall]: { ...current, ...patchWindow } } });
  };

  // Ușă — max. 1 per perete, aceeași logică ca la ferestre (listă, nu 4 sloturi fixe).
  const doorEntries = walls
    .filter((w) => draft.doors?.[w])
    .map((w) => [w, draft.doors![w]!] as const);
  const availableDoorWalls = walls.filter((w) => !draft.doors?.[w]);

  const addDoor = () => {
    const nextWall = availableDoorWalls[0];
    if (!nextWall) return;
    patch({ doors: { ...draft.doors, [nextWall]: { width: 0, height: 0 } } });
  };

  const removeDoor = (wall: Wall) => {
    const doors = { ...draft.doors };
    delete doors[wall];
    patch({ doors });
  };

  const removeAllDoors = () => patch({ doors: {} });

  const changeDoorWall = (oldWall: Wall, newWall: Wall) => {
    if (oldWall === newWall) return;
    const current = draft.doors?.[oldWall];
    if (!current) return;
    const doors = { ...draft.doors };
    delete doors[oldWall];
    doors[newWall] = current;
    patch({ doors });
  };

  const updateDoor = (wall: Wall, patchDoor: Partial<{ width: number; height: number }>) => {
    const current = draft.doors?.[wall];
    if (!current) return;
    patch({ doors: { ...draft.doors, [wall]: { ...current, ...patchDoor } } });
  };

  // Schimbarea materialului de pardoseală elimină configurarea specifică celuilalt tip de pereți —
  // faianța și vopsea/tapet sunt mutual exclusive, ca să nu rămână date orfane invizibile în UI.
  const changeFloorMaterial = (value: string) => {
    const floorMaterial = (value || undefined) as FlooringType | undefined;
    const nowGresie = floorMaterial === FlooringType.Gresie;
    patch({
      floorMaterial,
      wallTiling: nowGresie ? draft.wallTiling : undefined,
      wallFinish: nowGresie ? undefined : draft.wallFinish,
    });
  };

  // Preview instant la editare: calculăm dimensiunile pe `draft` client-side (oglinda backend-ului,
  // care rămâne sursa de adevăr pentru valorile SALVATE — vezi computeRoomDimensions/Problema 2).
  const dims = computeRoomDimensions(draft);
  const baseboard = dims.baseboardLength;
  const tilingArea = dims.wallTilingArea;
  const calcRows = buildRoomCalcRows(draft, dims);
  const windowCount = Object.keys(draft.windows ?? {}).length;
  const doorCount = Object.keys(draft.doors ?? {}).length;
  // Numerotarea secțiunilor se ajustează dinamic — „Ferestre" ocupă locul 2 sau 3 după cum e activată
  // placarea/finisajul pereților, iar „Uși" vine imediat după ea (vezi Baie vs. Living în Stitch).
  const windowsSectionNumber = wallTilingEnabled || wallFinishEnabled ? 3 : 2;
  const doorSectionNumber = windowsSectionNumber + 1;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 border-b border-line bg-surface px-6 py-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="material-symbols-outlined shrink-0 text-3xl text-primary">
            {ROOM_TYPE_ICONS[room.type]}
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1.5">
              <h3 className="truncate font-heading text-base font-bold md:text-xl">{room.name}</h3>
              {isConfigured || saved ? (
                <span
                  className="material-symbols-outlined icon-btn shrink-0 text-emerald-500/70"
                  title={saved ? "Salvat" : "Configurare salvată"}
                  aria-label={saved ? "Salvat" : "Configurare salvată"}
                >
                  {ACTION_ICONS.checkCircle}
                </span>
              ) : (
                <span
                  className="material-symbols-outlined icon-btn shrink-0 text-muted/50"
                  title="Neconfigurat încă"
                  aria-label="Neconfigurat încă"
                >
                  {ACTION_ICONS.notConfigured}
                </span>
              )}
            </span>
            <span className="text-[10px] font-bold uppercase text-muted">
              {ROOM_TYPE_DESCRIPTION[room.type]}
            </span>
          </div>
        </div>

        {!open && (
          <div className="hidden flex-1 items-center gap-x-4 px-4 text-[11px] font-medium text-muted lg:flex">
            {wallTilingEnabled ? (
              <>
                <span className="whitespace-nowrap">{(draft.floorArea ?? 0).toFixed(2)} mp pardoseală</span>
                <span className="whitespace-nowrap">{tilingArea.toFixed(2)} mp faianță</span>
                <span className="whitespace-nowrap">
                  placare {(draft.wallTiling?.tileHeight ?? 0).toFixed(2)}m
                </span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">{(draft.floorArea ?? 0).toFixed(2)} mp</span>
                {draft.floorMaterial && (
                  <span className="whitespace-nowrap">{draft.floorMaterial}</span>
                )}
                <span className="whitespace-nowrap">{baseboard.toFixed(2)} ml plintă</span>
              </>
            )}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-4">
          <span
            className={`material-symbols-outlined icon-btn transition-transform ${open ? "rotate-180" : ""}`}
          >
            {ACTION_ICONS.expandMore}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted transition-colors hover:bg-surface-low hover:text-tertiary"
            aria-label="Șterge camera"
          >
            <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.delete}</span>
          </span>
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-6 p-3 sm:gap-8 sm:p-6">
          <div className="space-y-4">
            <TechnicalSection
              number={1}
              icon={TECHNICAL_ICONS.floorAndWalls}
              title="Pardoseală"
              open={sectionsOpen.floor}
              onToggle={() => toggleSection("floor")}
            >
              <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2">
                <IconSelectField
                  label="Tip Material"
                  value={draft.floorMaterial ?? ""}
                  onChange={(v) => changeFloorMaterial(v)}
                  options={floorMaterialOptions}
                  placeholder="— Alege material —"
                />
                <label className="space-y-1">
                  <span className={labelCls}>Suprafață (MP)</span>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="ex: 5.40"
                    className={inputCls}
                    value={draft.floorArea ?? ""}
                    onChange={(e) =>
                      patch({ floorArea: e.target.value ? Number(e.target.value) : undefined })
                    }
                  />
                </label>
                {isGresie && (
                  <IconSelectField
                    label="Mărime plăci"
                    value={draft.tileSize ?? ""}
                    onChange={(v) => patch({ tileSize: (v || undefined) as TileSize })}
                    options={tileSizeOptions}
                  />
                )}
                {isGresie && (
                  <label className="space-y-1">
                    <span className={labelCls}>Înălțime plintă (cm)</span>
                    <input
                      type="number"
                      step="1"
                      min={0}
                      placeholder="ex: 8"
                      className={inputCls}
                      value={draft.baseboardHeight ? Math.round(draft.baseboardHeight * 100) : ""}
                      onChange={(e) =>
                        patch({
                          baseboardHeight: e.target.value ? Number(e.target.value) / 100 : undefined,
                        })
                      }
                    />
                  </label>
                )}
                <IconSelectField
                  label="Tip montaj"
                  wrapperClassName="md:col-span-2"
                  value={draft.installationType ?? ""}
                  onChange={(v) => patch({ installationType: (v || undefined) as InstallationType })}
                  options={installationTypeOptions}
                />
              </div>
            </TechnicalSection>

            {isGresie ? (
              wallTilingEnabled ? (
                <TechnicalSection
                  number={2}
                  icon={TECHNICAL_ICONS.wallTilingConfig}
                  title="Pereți"
                  open={sectionsOpen.walls}
                  onToggle={() => toggleSection("walls")}
                  action={
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWallTiling();
                      }}
                      className="text-xs font-bold text-secondary hover:underline"
                    >
                      Elimină placare
                    </button>
                  }
                >
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2">
                      <RoomShapeSelect
                        shape={draft.wallShape}
                        wallLengths={draft.wallTiling!.wallLengths}
                        floorArea={draft.floorArea}
                        onChangeShape={(wallShape) => patch({ wallShape })}
                        onChangeLengths={(wallLengths) =>
                          patch({ wallTiling: { ...draft.wallTiling!, wallLengths } })
                        }
                      />
                      <label className="space-y-1">
                        <span className={labelCls}>Înălțime Placare (M)</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="ex: 2.40"
                          className={inputCls}
                          value={draft.wallTiling!.tileHeight || ""}
                          onChange={(e) =>
                            patch({
                              wallTiling: {
                                ...draft.wallTiling!,
                                tileHeight: Number(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </label>
                    </div>
                    <div className="pt-2">
                      <RoomShapeLengthInputs
                        shape={draft.wallShape}
                        wallLengths={draft.wallTiling!.wallLengths}
                        floorArea={draft.floorArea}
                        onChangeLengths={(wallLengths) =>
                          patch({ wallTiling: { ...draft.wallTiling!, wallLengths } })
                        }
                      />
                    </div>
                    <p className="text-[10px] italic text-muted">
                      * Aceste dimensiuni sunt utilizate pentru calculul exact al necesarului de
                      faianță și plintă.
                    </p>
                  </>
                </TechnicalSection>
              ) : (
                <button
                  type="button"
                  onClick={toggleWallTiling}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line p-3 text-xs font-bold uppercase text-secondary hover:bg-surface-low"
                >
                  <span className="material-symbols-outlined text-sm">{ACTION_ICONS.add}</span>
                  Adaugă placare pereți
                </button>
              )
            ) /* Parchet/Mochetă — nu au faianță, doar vopsea/tapet pe pereți selectați individual */ : wallFinishEnabled ? (
              <TechnicalSection
                number={2}
                icon={TECHNICAL_ICONS.wallTilingConfig}
                title="Pereți"
                open={sectionsOpen.walls}
                onToggle={() => toggleSection("walls")}
                action={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWallFinish();
                    }}
                    className="text-xs font-bold text-secondary hover:underline"
                  >
                    Elimină finisaj
                  </button>
                }
              >
                <>
                  <div className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-2">
                    <RoomShapeSelect
                      shape={draft.wallShape}
                      wallLengths={draft.wallFinish!.wallLengths}
                      floorArea={draft.floorArea}
                      onChangeShape={(wallShape) => patch({ wallShape })}
                      onChangeLengths={(wallLengths) =>
                        patch({ wallFinish: { ...draft.wallFinish!, wallLengths } })
                      }
                    />
                    <label className="space-y-1">
                      <span className={labelCls}>Înălțime Pereți (M)</span>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="ex: 2.50"
                        className={inputCls}
                        value={draft.wallFinish!.wallHeight || ""}
                        onChange={(e) =>
                          patch({
                            wallFinish: {
                              ...draft.wallFinish!,
                              wallHeight: Number(e.target.value) || 0,
                            },
                          })
                        }
                      />
                    </label>
                  </div>
                  <RoomShapeLengthInputs
                    shape={draft.wallShape}
                    wallLengths={draft.wallFinish!.wallLengths}
                    floorArea={draft.floorArea}
                    onChangeLengths={(wallLengths) =>
                      patch({ wallFinish: { ...draft.wallFinish!, wallLengths } })
                    }
                  />
                  {draft.wallShape && (
                    <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
                      {walls.map((w) => (
                        <div key={w} className="space-y-2 rounded-lg border border-line/50 p-3">
                          <span className={labelCls}>
                            {WALL_LABELS[w]} ({(draft.wallFinish!.wallLengths[w] || 0).toFixed(2)} m)
                          </span>
                          <select
                            className={selectCls}
                            value={draft.wallFinish!.finishes[w] ?? ""}
                            onChange={(e) =>
                              patch({
                                wallFinish: {
                                  ...draft.wallFinish!,
                                  finishes: {
                                    ...draft.wallFinish!.finishes,
                                    [w]: (e.target.value || undefined) as
                                      | WallFinishType
                                      | undefined,
                                  },
                                },
                              })
                            }
                          >
                            <option value="">— Fără —</option>
                            {wallFinishTypes.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] italic text-muted">
                    * Alege Vopsea sau Tapet independent, per perete — golul ușii se scade automat de
                    pe peretele ei.
                  </p>
                </>
              </TechnicalSection>
            ) : (
              <button
                type="button"
                onClick={toggleWallFinish}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line p-3 text-xs font-bold uppercase text-secondary hover:bg-surface-low"
              >
                <span className="material-symbols-outlined text-sm">{ACTION_ICONS.add}</span>
                Adaugă finisaj pereți
              </button>
            )}

            <TechnicalSection
              number={windowsSectionNumber}
              icon={TECHNICAL_ICONS.windowConfig}
              title="Ferestre"
              open={sectionsOpen.windows}
              onToggle={() => toggleSection("windows")}
              action={
                windowCount > 0 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeAllWindows();
                    }}
                    className="text-xs font-bold text-secondary hover:underline"
                  >
                    Elimină ferestre
                  </button>
                ) : undefined
              }
            >
              {windowEntries.length > 0 && (
                <div className="space-y-4">
                  {windowEntries.map(([w, win]) => (
                    <div
                      key={w}
                      className="grid grid-cols-1 items-end gap-3 rounded-lg border border-line/50 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-4"
                    >
                      <SelectField
                        label="Perete"
                        value={w}
                        onChange={(e) => changeWindowWall(w, e.target.value as Wall)}
                      >
                        <option value={w}>{WALL_LABELS[w]}</option>
                        {availableWalls.map((aw) => (
                          <option key={aw} value={aw}>
                            {WALL_LABELS[aw]}
                          </option>
                        ))}
                      </SelectField>
                      <label className="space-y-1">
                        <span className={labelCls}>Lățime (m) — L</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="ex: 1.20"
                          className={inputCls}
                          value={win.width || ""}
                          onChange={(e) =>
                            updateWindow(w, { width: Number(e.target.value) || 0 })
                          }
                        />
                      </label>
                      <label className="space-y-1">
                        <span className={labelCls}>Înălțime (m) — H</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="ex: 1.40"
                          className={inputCls}
                          value={win.height || ""}
                          onChange={(e) =>
                            updateWindow(w, { height: Number(e.target.value) || 0 })
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeWindow(w)}
                        className="rounded-lg p-3 text-muted transition-colors hover:bg-surface-low hover:text-tertiary sm:self-end"
                        aria-label={`Elimină fereastra de pe peretele ${w}`}
                      >
                        <span className="material-symbols-outlined icon-btn">
                          {ACTION_ICONS.delete}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {availableWalls.length > 0 && (
                <button
                  type="button"
                  onClick={addWindow}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line p-3 text-xs font-bold uppercase text-secondary hover:bg-surface-low"
                >
                  <span className="material-symbols-outlined text-sm">{ACTION_ICONS.add}</span>
                  Adaugă fereastră
                </button>
              )}
              <p className="text-[10px] italic text-muted">
                * Maxim o fereastră per perete (4 în total). L = lățime, H = înălțime. Aria ferestrei
                se scade din faianța/vopseaua/tapetul peretelui respectiv, iar glaful de bordură din
                jurul ei se adaugă separat, la fel ca plinta.
              </p>
            </TechnicalSection>

            <TechnicalSection
              number={doorSectionNumber}
              icon={TECHNICAL_ICONS.doorConfig}
              title="Uși"
              open={sectionsOpen.doors}
              onToggle={() => toggleSection("doors")}
              action={
                doorCount > 0 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeAllDoors();
                    }}
                    className="text-xs font-bold text-secondary hover:underline"
                  >
                    Elimină uși
                  </button>
                ) : undefined
              }
            >
              {doorEntries.length > 0 && (
                <div className="space-y-4">
                  {doorEntries.map(([w, d]) => (
                    <div
                      key={w}
                      className="grid grid-cols-1 items-end gap-3 rounded-lg border border-line/50 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:gap-4"
                    >
                      <SelectField
                        label="Perete"
                        value={w}
                        onChange={(e) => changeDoorWall(w, e.target.value as Wall)}
                      >
                        <option value={w}>{WALL_LABELS[w]}</option>
                        {availableDoorWalls.map((aw) => (
                          <option key={aw} value={aw}>
                            {WALL_LABELS[aw]}
                          </option>
                        ))}
                      </SelectField>
                      <label className="space-y-1">
                        <span className={labelCls}>Lățime (m) — L</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="ex: 0.80"
                          className={inputCls}
                          value={d.width || ""}
                          onChange={(e) => updateDoor(w, { width: Number(e.target.value) || 0 })}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className={labelCls}>Înălțime (m) — H</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="ex: 2.10"
                          className={inputCls}
                          value={d.height || ""}
                          onChange={(e) => updateDoor(w, { height: Number(e.target.value) || 0 })}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeDoor(w)}
                        className="rounded-lg p-3 text-muted transition-colors hover:bg-surface-low hover:text-tertiary sm:self-end"
                        aria-label={`Elimină ușa de pe peretele ${w}`}
                      >
                        <span className="material-symbols-outlined icon-btn">
                          {ACTION_ICONS.delete}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {availableDoorWalls.length > 0 && (
                <button
                  type="button"
                  onClick={addDoor}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line p-3 text-xs font-bold uppercase text-secondary hover:bg-surface-low"
                >
                  <span className="material-symbols-outlined text-sm">{ACTION_ICONS.add}</span>
                  Adaugă ușă
                </button>
              )}
              <p className="text-[10px] italic text-secondary">
                * Maxim o ușă per perete (4 în total). L = lățime, H = înălțime. Golul ușii se scade
                automat din plintă / faianța / vopseaua / tapetul peretelui respectiv.
              </p>
            </TechnicalSection>
          </div>

          <div className="border-t border-line/50 pt-6">
            <h4 className="mb-4 border-b border-line pb-2 text-xs font-bold uppercase tracking-wider text-muted">
              Schiță &amp; Rezultat
            </h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <RoomSketch room={draft} />

              <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between border-b border-line/50 pb-2 text-sm font-bold">
                  <span className="text-[11px] uppercase tracking-tight">Calcule Detaliate</span>
                  <span className="material-symbols-outlined text-sm text-muted">
                    {TECHNICAL_ICONS.calculatedResults}
                  </span>
                </div>

                <div className="space-y-3">
                  {calcRows.map((row) => (
                    <ResultRow key={row.label} {...row} />
                  ))}

                  {isGresie && !!draft.perimeter && !draft.baseboardHeight && (
                    <p className="text-[10px] italic text-tertiary">
                      Completează câmpul Înălțime plintă pentru a include plinta în necesarul de gresie.
                    </p>
                  )}

                  {wallTilingEnabled && !draft.wallTiling!.tileHeight && (
                    <p className="text-[10px] italic text-tertiary">
                      Înălțime Placare e 0 → aria de faianță e 0. Completează câmpul mai sus.
                    </p>
                  )}

                  {wallFinishEnabled && !draft.wallFinish!.wallHeight && (
                    <p className="text-[10px] italic text-tertiary">
                      Înălțime Pereți e 0 → aria de vopsea/tapet e 0. Completează câmpul mai sus.
                    </p>
                  )}

                  {!hasFloorConfig(draft) && !draft.perimeter && (
                    <p className="text-sm text-muted">
                      Completează pardoseala pentru a vedea calculele.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={savePending}
            aria-busy={savePending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savePending && <Spinner />}
            Salvează
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Șterge camera"
        message={`Sigur vrei să ștergi „${room.name}"? Elementele asociate acestei camere vor fi șterse și ele.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteRoom(room.id);
          setConfirmDelete(false);
        }}
      />
    </div>
  );
}
