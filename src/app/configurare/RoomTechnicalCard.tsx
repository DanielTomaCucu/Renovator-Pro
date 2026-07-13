"use client";

import { useState } from "react";
import {
  FlooringType,
  InstallationType,
  Room,
  RoomType,
  TileSize,
  Wall,
} from "@/shared/types";
import { useStore } from "@/shared/store";
import { ACTION_ICONS, ROOM_TYPE_ICONS, TECHNICAL_ICONS } from "@/shared/icons";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  baseboardLength,
  doorWallBaseboardLength,
  floorMaterialNeeded,
  hasFloorConfig,
  wallTilingArea,
} from "./dimensions";

const floorMaterials = Object.values(FlooringType);
const tileSizes = Object.values(TileSize);
const installationTypes = Object.values(InstallationType);
const walls = Object.values(Wall);

/** Descriere scurtă per tip de cameră — afișată sub numele camerei în card. */
const ROOM_TYPE_DESCRIPTION: Record<RoomType, string> = {
  [RoomType.Dormitor]: "Zona de odihnă",
  [RoomType.Baie]: "Zona umedă",
  [RoomType.Living]: "Zona de zi",
  [RoomType.Bucatarie]: "Zona de gătit",
  [RoomType.Terasa]: "Zonă exterioară",
  [RoomType.Balcon]: "Zonă exterioară",
};

const selectCls =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";
const inputCls =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 font-mono text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";
const labelCls = "block text-[10px] font-bold uppercase text-muted";

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
  const [open, setOpen] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const patch = (p: Partial<Room>) => updateRoom(room.id, p);

  const wallTilingEnabled = !!room.wallTiling;
  const toggleWallTiling = () => {
    if (wallTilingEnabled) {
      patch({ wallTiling: undefined });
    } else {
      patch({
        wallTiling: {
          tiledWallsCount: 0,
          tileHeight: 0,
          wallLengths: { [Wall.Nord]: 0, [Wall.Est]: 0, [Wall.Sud]: 0, [Wall.Vest]: 0 },
        },
      });
    }
  };

  const baseboard = baseboardLength(room);
  const materialNeeded = floorMaterialNeeded(room);
  const tilingArea = wallTilingArea(room);
  const doorBaseboard = doorWallBaseboardLength(room);

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-4 border-b border-line bg-surface-low px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-primary">
            {ROOM_TYPE_ICONS[room.type]}
          </span>
          <div className="flex flex-col">
            <h3 className="font-heading text-xl font-bold">{room.name}</h3>
            <span className="text-[10px] font-bold uppercase text-muted">
              {ROOM_TYPE_DESCRIPTION[room.type]}
            </span>
          </div>
        </div>

        {!open && (
          <div className="flex flex-1 items-center gap-6 px-4">
            <span className="text-xs font-bold uppercase text-muted">
              {(room.floorArea ?? 0).toFixed(2)} mp
            </span>
            {room.floorMaterial && (
              <span className="text-xs font-bold uppercase text-muted">
                {room.floorMaterial}
              </span>
            )}
            <span className="text-xs font-bold uppercase text-muted">
              {baseboard.toFixed(2)} ml Plintă
            </span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <span
            className={`material-symbols-outlined transition-transform ${open ? "rotate-180" : ""}`}
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
            className="text-muted hover:text-tertiary"
            aria-label="Șterge camera"
          >
            <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.delete}</span>
          </span>
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-8 p-6">
          <div className="space-y-6">
            <h4 className="border-b border-line pb-2 text-xs font-bold uppercase tracking-wider text-muted">
              1. Configurare Tehnică
            </h4>

            <div className="space-y-3">
              <h5 className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                <span className="material-symbols-outlined text-sm">
                  {TECHNICAL_ICONS.floorAndWalls}
                </span>
                Pardoseală
              </h5>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <label className="space-y-1">
                  <span className={labelCls}>Tip Material</span>
                  <select
                    className={selectCls}
                    value={room.floorMaterial ?? ""}
                    onChange={(e) =>
                      patch({ floorMaterial: (e.target.value || undefined) as FlooringType })
                    }
                  >
                    <option value="">— Alege material —</option>
                    {floorMaterials.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className={labelCls}>Suprafață (MP)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className={inputCls}
                      value={room.floorArea ?? 0}
                      onChange={(e) => patch({ floorArea: Number(e.target.value) })}
                    />
                    <span className="font-mono text-[10px] text-muted">mp</span>
                  </div>
                </label>
                <label className="space-y-1">
                  <span className={labelCls}>Perimetru</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className={inputCls}
                      value={room.perimeter ?? 0}
                      onChange={(e) => patch({ perimeter: Number(e.target.value) })}
                    />
                    <span className="font-mono text-[10px] text-muted">ml</span>
                  </div>
                </label>
                <label className="space-y-1">
                  <span className={labelCls}>Mărime plăci</span>
                  <select
                    className={selectCls}
                    value={room.tileSize ?? ""}
                    onChange={(e) =>
                      patch({ tileSize: (e.target.value || undefined) as TileSize })
                    }
                  >
                    <option value="">— Alege —</option>
                    {tileSizes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className={labelCls}>Tip montaj</span>
                  <select
                    className={selectCls}
                    value={room.installationType ?? ""}
                    onChange={(e) =>
                      patch({
                        installationType: (e.target.value || undefined) as InstallationType,
                      })
                    }
                  >
                    <option value="">— Alege —</option>
                    {installationTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="space-y-4 border-t border-line/50 pt-4">
              <div className="flex items-center justify-between">
                <h5 className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                  <span className="material-symbols-outlined text-sm">
                    {TECHNICAL_ICONS.wallTilingConfig}
                  </span>
                  Configurare Detaliată Placări
                </h5>
                <button
                  type="button"
                  onClick={toggleWallTiling}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  {wallTilingEnabled ? "Elimină placare" : "+ Adaugă placare pereți"}
                </button>
              </div>

              {room.wallTiling && (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className={labelCls}>Număr pereți placați</span>
                      <select
                        className={selectCls}
                        value={room.wallTiling.tiledWallsCount}
                        onChange={(e) =>
                          patch({
                            wallTiling: {
                              ...room.wallTiling!,
                              tiledWallsCount: Number(e.target.value),
                            },
                          })
                        }
                      >
                        {[0, 1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className={labelCls}>Înălțime Placare (m)</span>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        className={inputCls}
                        value={room.wallTiling.tileHeight}
                        onChange={(e) =>
                          patch({
                            wallTiling: {
                              ...room.wallTiling!,
                              tileHeight: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
                    {walls.map((w) => (
                      <label key={w} className="space-y-1">
                        <span className={labelCls}>Perete {w}</span>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          className={inputCls}
                          value={room.wallTiling!.wallLengths[w]}
                          onChange={(e) =>
                            patch({
                              wallTiling: {
                                ...room.wallTiling!,
                                wallLengths: {
                                  ...room.wallTiling!.wallLengths,
                                  [w]: Number(e.target.value),
                                },
                              },
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] italic text-muted">
                    * Aceste dimensiuni sunt utilizate pentru calculul exact al necesarului de
                    faianță și plintă.
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3 border-t border-line/50 pt-4">
              <h5 className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                <span className="material-symbols-outlined text-sm">
                  {TECHNICAL_ICONS.doorConfig}
                </span>
                Configurare Ușă
              </h5>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <label className="space-y-1">
                  <span className={labelCls}>Lățime (m)</span>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    className={inputCls}
                    value={room.door?.width ?? 0}
                    onChange={(e) =>
                      patch({
                        door: {
                          width: Number(e.target.value),
                          height: room.door?.height ?? 0,
                          wall: room.door?.wall ?? Wall.Nord,
                        },
                      })
                    }
                  />
                </label>
                <label className="space-y-1">
                  <span className={labelCls}>Înălțime (m)</span>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    className={inputCls}
                    value={room.door?.height ?? 0}
                    onChange={(e) =>
                      patch({
                        door: {
                          width: room.door?.width ?? 0,
                          height: Number(e.target.value),
                          wall: room.door?.wall ?? Wall.Nord,
                        },
                      })
                    }
                  />
                </label>
                <label className="space-y-1">
                  <span className={labelCls}>Perete</span>
                  <select
                    className={selectCls}
                    value={room.door?.wall ?? Wall.Nord}
                    onChange={(e) =>
                      patch({
                        door: {
                          width: room.door?.width ?? 0,
                          height: room.door?.height ?? 0,
                          wall: e.target.value as Wall,
                        },
                      })
                    }
                  >
                    {walls.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="text-[10px] italic text-secondary">
                * Golul de ușă se scade automat din plintă / faianța peretelui selectat.
              </p>
            </div>
          </div>

          <div className="border-t border-line/50 pt-6">
            <h4 className="mb-4 border-b border-line pb-2 text-xs font-bold uppercase tracking-wider text-muted">
              Schiță &amp; Rezultat
            </h4>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

              <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between border-b border-line/50 pb-2 text-sm font-bold">
                  <span className="text-[11px] uppercase tracking-tight">Calcule Detaliate</span>
                  <span className="material-symbols-outlined text-sm text-muted">
                    {TECHNICAL_ICONS.calculatedResults}
                  </span>
                </div>

                <div className="space-y-3">
                  {hasFloorConfig(room) && (
                    <ResultRow
                      label={`${room.floorMaterial} (Pardoseală)`}
                      value={`${materialNeeded.toFixed(2)} mp`}
                      formula={`${room.floorArea!.toFixed(2)} mp + 10% pierdere`}
                      math={`${room.floorArea!.toFixed(2)} × 1.10 = ${materialNeeded.toFixed(2)} mp`}
                    />
                  )}

                  {!!room.perimeter && (
                    <ResultRow
                      label="Plintă"
                      value={`${baseboard.toFixed(2)} ml`}
                      formula="(Perimetru − lățime ușă) + 5% pierdere"
                      math={`(${room.perimeter.toFixed(2)} − ${(room.door?.width ?? 0).toFixed(2)}) × 1.05 = ${baseboard.toFixed(2)} ml`}
                    />
                  )}

                  {room.wallTiling && room.wallTiling.tiledWallsCount > 0 && (
                    <ResultRow
                      label={`Faianță (${room.wallTiling.tiledWallsCount} pereți)`}
                      value={`${tilingArea.toFixed(2)} mp`}
                      formula="(Σ lungime pereți placați × înălțime − gol ușă) + 10% pierdere"
                      math={`${tilingArea.toFixed(2)} mp`}
                    />
                  )}

                  {room.wallTiling && room.door && room.wallTiling.wallLengths[room.door.wall] > 0 && (
                    <ResultRow
                      label={`Plintă (Perete ${room.door.wall})`}
                      value={`${doorBaseboard.toFixed(2)} ml`}
                      formula="(Lungime perete ușă − lățime ușă) + 5% pierdere"
                      math={`(${room.wallTiling.wallLengths[room.door.wall].toFixed(2)} − ${room.door.width.toFixed(2)}) × 1.05 = ${doorBaseboard.toFixed(2)} ml`}
                    />
                  )}

                  {!hasFloorConfig(room) && !room.perimeter && (
                    <p className="text-sm text-muted">
                      Completează pardoseala și perimetrul pentru a vedea calculele.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Șterge camera"
        message={`Sigur vrei să ștergi „${room.name}"? Elementele asociate acestei camere vor fi șterse și ele.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteRoom(room.id);
          setConfirmDelete(false);
        }}
      />
    </div>
  );
}
