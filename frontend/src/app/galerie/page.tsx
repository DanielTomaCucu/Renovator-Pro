"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DashboardSummaryCard from "@/components/DashboardSummaryCard";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useStore } from "@/shared/store";
import { InspirationImage } from "@/shared/types";
import { ACTION_ICONS, GALLERY_ICONS, INSPIRATION_TYPE_ICONS, ROOM_TYPE_ICONS } from "@/shared/icons";
import GalleryFormDrawer from "./GalleryFormDrawer";
import { GalleryDrawerState } from "./GalleryDrawerState";
import Lightbox from "./Lightbox";

const GENERAL_FILTER = "general";
const ALL_FILTER = "all";

export default function GaleriePage() {
  const { rooms, inspirationImages, deleteInspirationImage } = useStore();

  const [roomFilter, setRoomFilter] = useState<string>(ALL_FILTER);
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<GalleryDrawerState>({ open: false });
  const [lightboxImage, setLightboxImage] = useState<InspirationImage | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const visibleImages = inspirationImages
    .filter((img) => {
      if (roomFilter === ALL_FILTER) return true;
      if (roomFilter === GENERAL_FILTER) return !img.roomId;
      return img.roomId === roomFilter;
    })
    .filter((img) => (img.caption ?? "").toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const roomSections = rooms
    .map((room) => ({ room, images: visibleImages.filter((img) => img.roomId === room.id) }))
    .filter((section) => section.images.length > 0);
  const generalImages = visibleImages.filter((img) => !img.roomId);

  const roomsWithImages = new Set(inspirationImages.filter((img) => img.roomId).map((img) => img.roomId)).size;
  const unassignedCount = inspirationImages.filter((img) => !img.roomId).length;

  const deleteTarget = inspirationImages.find((img) => img.id === deleteTargetId);

  return (
    <div>
      <PageHeader
        title="Galerie Inspirație"
        searchPlaceholder="Caută în notițe..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-10">
        <DashboardSummaryCard
          metrics={[
            { label: "Total poze", value: String(inspirationImages.length) },
            { label: "Camere ilustrate", value: String(roomsWithImages) },
            { label: "Neasignate", value: String(unassignedCount) },
          ]}
        />

        {/* Titlu mobil (PageHeader e ascuns sub md) pe rândul lui; filtrele + butonul Adaugă pe același rând. */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="basis-full font-heading text-lg font-bold text-primary md:hidden">Galerie Inspirație</h1>
          {inspirationImages.length > 0 && (
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
              <FilterChip active={roomFilter === ALL_FILTER} onClick={() => setRoomFilter(ALL_FILTER)}>
                Toate
              </FilterChip>
              {rooms.map((r) => (
                <FilterChip key={r.id} active={roomFilter === r.id} onClick={() => setRoomFilter(r.id)} icon={ROOM_TYPE_ICONS[r.type]}>
                  {r.name}
                </FilterChip>
              ))}
              {unassignedCount > 0 && (
                <FilterChip active={roomFilter === GENERAL_FILTER} onClick={() => setRoomFilter(GENERAL_FILTER)} icon={GALLERY_ICONS.unassigned}>
                  General
                </FilterChip>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setDrawer({ open: true })}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-transform hover:opacity-90 active:scale-[0.98] ml-auto"
          >
            <span className="material-symbols-outlined icon-btn">{GALLERY_ICONS.addImage}</span>
            Adaugă Poză
          </button>
        </div>

        {inspirationImages.length === 0 ? (
          <EmptyState
            icon={GALLERY_ICONS.emptyState}
            title="Galeria e goală deocamdată"
            description="Adaugă poze proprii, randări sau inspirație găsită online — organizate pe camere, ca să ai totul la un loc când decizi."
            actionLabel="+ Adaugă Poză"
            onAction={() => setDrawer({ open: true })}
          />
        ) : (
          <div className="space-y-6">
            {roomSections.map(({ room, images }) => (
              <section key={room.id} className="space-y-3">
                <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                    {ROOM_TYPE_ICONS[room.type]}
                  </span>
                  {room.name}
                  <span className="font-mono normal-case text-muted/70">({images.length})</span>
                </h2>
                <ImageGrid
                  images={images}
                  onOpen={setLightboxImage}
                  onEdit={(img) => setDrawer({ open: true, image: img })}
                  onDelete={(img) => setDeleteTargetId(img.id)}
                />
              </section>
            ))}

            {generalImages.length > 0 && (
              <section className="space-y-3">
                <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                  <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                    {GALLERY_ICONS.unassigned}
                  </span>
                  General <span className="font-mono normal-case text-muted/70">({generalImages.length})</span>
                </h2>
                <ImageGrid
                  images={generalImages}
                  onOpen={setLightboxImage}
                  onEdit={(img) => setDrawer({ open: true, image: img })}
                  onDelete={(img) => setDeleteTargetId(img.id)}
                />
              </section>
            )}

            {visibleImages.length === 0 && (
              <p className="py-12 text-center text-sm text-muted">Niciun rezultat pentru filtrele curente.</p>
            )}
          </div>
        )}
      </div>

      <GalleryFormDrawer state={drawer} onClose={() => setDrawer({ open: false })} />

      {lightboxImage && (
        <Lightbox image={lightboxImage.image} caption={lightboxImage.caption} onClose={() => setLightboxImage(null)} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Confirmare Ștergere"
        message="Sigur ștergi această poză din galerie? Acțiunea nu poate fi anulată."
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (!deleteTargetId) return;
          await deleteInspirationImage(deleteTargetId);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
        active ? "border-primary bg-primary text-white" : "border-line text-muted hover:bg-surface-low"
      }`}
    >
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

/** Grid Pinterest-style (pătrate uniforme, nu masonry — mai robust cross-breakpoint) — 2 col mobil → 3–4 desktop. */
function ImageGrid({
  images,
  onOpen,
  onEdit,
  onDelete,
}: {
  images: InspirationImage[];
  onOpen: (image: InspirationImage) => void;
  onEdit: (image: InspirationImage) => void;
  onDelete: (image: InspirationImage) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((img) => (
        <div key={img.id} className="overflow-hidden rounded-xl border border-line bg-surface">
          <div className="relative">
            <button type="button" onClick={() => onOpen(img)} className="block w-full cursor-zoom-in" aria-label="Vezi poza mărită">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.image} alt={img.caption ?? "Poză din galerie"} className="aspect-square w-full object-cover" />
            </button>
            <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                {INSPIRATION_TYPE_ICONS[img.type]}
              </span>
              {img.type}
            </span>
            <div className="absolute right-2 top-2 flex gap-1">
              <button
                type="button"
                onClick={() => onEdit(img)}
                aria-label="Editează poza"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.editInline}</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(img)}
                aria-label="Șterge poza"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.delete}</span>
              </button>
            </div>
          </div>
          {img.caption && <p className="truncate px-2.5 py-2 text-xs text-muted">{img.caption}</p>}
        </div>
      ))}
    </div>
  );
}
