"use client";

import { useState, type ReactNode, type SelectHTMLAttributes } from "react";
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
  "w-full appearance-none rounded-lg border border-line-strong bg-surface px-4 py-3 text-sm font-medium outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";
const inputCls =
  "w-full rounded-lg border border-line-strong bg-surface px-4 py-3 font-mono text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";
const labelCls = "block text-[10px] font-bold uppercase text-muted";

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

/** Sub-secțiune colapsabilă în corpul unui card de cameră (accordion nativ `<details>`), numerotată. */
function TechnicalSection({
  number,
  icon,
  title,
  action,
  defaultOpen = true,
  children,
}: {
  number: number;
  icon: string;
  title: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group/section overflow-hidden rounded-xl border border-line/50"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between border-b border-line bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">{icon}</span>
          <h5 className="text-xs font-bold uppercase tracking-wider text-primary">
            {number}. {title}
          </h5>
        </div>
        <div className="flex items-center gap-4">
          {action}
          <span className="material-symbols-outlined text-muted transition-transform group-open/section:rotate-180">
            {ACTION_ICONS.expandMore}
          </span>
        </div>
      </summary>
      <div className="space-y-6 bg-surface p-6">{children}</div>
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
  const [open, setOpen] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Bugetul alocat e opțional — vizibil implicit doar dacă are deja o valoare completată.
  const [budgetOpen, setBudgetOpen] = useState(room.allocatedBudget > 0);

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
  // Numerotarea secțiunilor se ajustează dinamic — „Configurare Ușă" e a 2-a secțiune dacă
  // placarea pereților nu e activată pt. cameră, sau a 3-a dacă e activată (vezi Baie vs. Living în Stitch).
  const doorSectionNumber = wallTilingEnabled ? 3 : 2;

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
            <h3 className="truncate font-heading text-xl font-bold">{room.name}</h3>
            <span className="text-[10px] font-bold uppercase text-muted">
              {ROOM_TYPE_DESCRIPTION[room.type]}
            </span>
          </div>
        </div>

        {!open && (
          <div className="hidden flex-1 items-center gap-x-4 px-4 text-[11px] font-medium text-muted lg:flex">
            {wallTilingEnabled ? (
              <>
                <span className="whitespace-nowrap">{(room.floorArea ?? 0).toFixed(2)} mp pardoseală</span>
                <span className="whitespace-nowrap">{tilingArea.toFixed(2)} mp faianță</span>
                <span className="whitespace-nowrap">
                  placare {(room.wallTiling?.tileHeight ?? 0).toFixed(2)}m
                </span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">{(room.floorArea ?? 0).toFixed(2)} mp</span>
                {room.floorMaterial && (
                  <span className="whitespace-nowrap">{room.floorMaterial}</span>
                )}
                <span className="whitespace-nowrap">{baseboard.toFixed(2)} ml plintă</span>
              </>
            )}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-4">
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

      {budgetOpen ? (
        <label className="flex items-center justify-between border-b border-line bg-surface px-6 py-3 text-sm text-muted">
          Buget alocat (€)
          <span className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={room.allocatedBudget}
              onChange={(e) => patch({ allocatedBudget: Number(e.target.value) })}
              className="w-32 rounded-lg border border-line-strong px-3 py-2 text-right font-mono text-sm text-foreground outline-none focus:border-secondary"
            />
            <button
              type="button"
              onClick={() => {
                patch({ allocatedBudget: 0 });
                setBudgetOpen(false);
              }}
              className="text-muted hover:text-tertiary"
              aria-label="Elimină buget alocat"
            >
              <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.close}</span>
            </button>
          </span>
        </label>
      ) : (
        <button
          type="button"
          onClick={() => setBudgetOpen(true)}
          className="flex w-full items-center gap-1 border-b border-line bg-surface px-6 py-2.5 text-[11px] font-bold uppercase text-secondary hover:bg-surface-low"
        >
          <span className="material-symbols-outlined text-sm">{ACTION_ICONS.add}</span>
          Adaugă buget alocat
        </button>
      )}

      {open && (
        <div className="flex flex-col gap-8 p-6">
          <div className="space-y-4">
            <TechnicalSection number={1} icon={TECHNICAL_ICONS.floorAndWalls} title="Pardoseală & Pereți">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <SelectField
                  label="Tip Material"
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
                </SelectField>
                <label className="space-y-1">
                  <span className={labelCls}>Suprafață (MP)</span>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    className={inputCls}
                    value={room.floorArea ?? 0}
                    onChange={(e) => patch({ floorArea: Number(e.target.value) })}
                  />
                </label>
                {room.floorMaterial === FlooringType.Gresie && (
                  <SelectField
                    label="Mărime plăci"
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
                  </SelectField>
                )}
                <SelectField
                  label="Tip montaj"
                  wrapperClassName="md:col-span-2"
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
                </SelectField>
              </div>
            </TechnicalSection>

            {wallTilingEnabled ? (
              <TechnicalSection
                number={2}
                icon={TECHNICAL_ICONS.wallTilingConfig}
                title="Placări Detaliate"
                action={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWallTiling();
                    }}
                    className="text-xs font-bold text-secondary hover:underline"
                  >
                    Elimină placare
                  </button>
                }
              >
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <SelectField
                      label="Număr pereți placați"
                      value={room.wallTiling!.tiledWallsCount}
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
                    </SelectField>
                    <label className="space-y-1">
                      <span className={labelCls}>Înălțime Placare (M)</span>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        className={inputCls}
                        value={room.wallTiling!.tileHeight}
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
                  {room.wallTiling!.tiledWallsCount > 0 && (
                    <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
                      {walls.slice(0, room.wallTiling!.tiledWallsCount).map((w) => (
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
                  )}
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
            )}

            <TechnicalSection
              number={doorSectionNumber}
              icon={TECHNICAL_ICONS.doorConfig}
              title="Configurare Ușă"
            >
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
                <SelectField
                  label="Perete"
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
                </SelectField>
              </div>
              <p className="text-[10px] italic text-secondary">
                * Golul de ușă se scade automat din plintă / faianța peretelui selectat.
              </p>
            </TechnicalSection>
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
                      Completează pardoseala pentru a vedea calculele.
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
