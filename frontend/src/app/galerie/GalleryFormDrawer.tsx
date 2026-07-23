"use client";

import { useState } from "react";
import Drawer from "@/components/Drawer";
import Spinner from "@/components/Spinner";
import { Field, PrimaryButton, inputCls } from "@/components/forms";
import { useStore } from "@/shared/store";
import { useAsyncAction } from "@/shared/useAsyncAction";
import { compressImage } from "@/shared/functions";
import { InspirationType } from "@/shared/types";
import { GALLERY_ICONS, INSPIRATION_TYPE_ICONS } from "@/shared/icons";
import { GalleryDrawerState } from "./GalleryDrawerState";

const GENERAL_ROOM_VALUE = "";

export default function GalleryFormDrawer({ state, onClose }: { state: GalleryDrawerState; onClose: () => void }) {
  const { rooms, addInspirationImage, updateInspirationImage } = useStore();
  const { open, image: editing, defaultRoomId } = state;

  const [type, setType] = useState<InspirationType>(InspirationType.PozaProprie);
  const [roomId, setRoomId] = useState(GENERAL_ROOM_VALUE);
  const [image, setImage] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [caption, setCaption] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [compressing, setCompressing] = useState(false);

  // Resetează/populează formularul la fiecare deschidere — „adjusting state during render", nu useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setType(editing?.type ?? InspirationType.PozaProprie);
      setRoomId(editing?.roomId ?? defaultRoomId ?? GENERAL_ROOM_VALUE);
      setImage(editing?.image ?? "");
      setImageUrlInput("");
      setCaption(editing?.caption ?? "");
      setSourceUrl(editing?.sourceUrl ?? "");
    }
  }

  async function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCompressing(true);
    try {
      setImage(await compressImage(file));
    } finally {
      setCompressing(false);
    }
  }

  function useImageUrl() {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImage(url);
    setImageUrlInput("");
  }

  const { run: submit, pending } = useAsyncAction(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    const data = {
      roomId: roomId || undefined,
      type,
      image,
      caption: caption.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
    };
    if (editing) await updateInspirationImage(editing.id, data);
    else await addInspirationImage(data);
    onClose();
  });

  const formId = "gallery-image-form";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? "Editează Poza" : "Adaugă Poză"}
      footer={
        <div className="space-y-3">
          <PrimaryButton type="submit" form={formId} pending={pending} disabled={!image}>
            {editing ? "Salvează Modificările" : "Adaugă în Galerie"}
          </PrimaryButton>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="w-full py-2 text-sm text-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anulează
          </button>
        </div>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-4">
        {/* Poza — primul câmp, cel mai proeminent: fluxul principal e „fă/alege o poză acum". */}
        <Field label="Poză">
          <div className="space-y-2">
            {image && (
              <div className="relative h-40 w-full overflow-hidden rounded-lg border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Previzualizare" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  aria-label="Elimină poza"
                  className="absolute right-2 top-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <span className="material-symbols-outlined icon-btn">close</span>
                </button>
              </div>
            )}
            {!image && (
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface-low p-4 text-[12px] font-bold text-muted transition-colors hover:border-secondary hover:text-secondary active:scale-[0.98]">
                {compressing ? <Spinner /> : (
                  <span className="material-symbols-outlined icon-btn">{GALLERY_ICONS.addImage}</span>
                )}
                {compressing ? "Se procesează..." : "Fă / alege o poză"}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={compressing}
                  onChange={handlePhotoFile}
                  className="hidden"
                />
              </label>
            )}
            {!image && (
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="sau lipește un URL de poză"
                />
                <button
                  type="button"
                  onClick={useImageUrl}
                  disabled={!imageUrlInput.trim()}
                  className="shrink-0 rounded-md border border-line px-3 text-xs font-bold text-muted hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Adaugă
                </button>
              </div>
            )}
          </div>
        </Field>

        <Field label="Tip">
          <div className="grid grid-cols-3 gap-2">
            {Object.values(InspirationType).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center text-[11px] font-semibold transition-colors ${
                  type === t ? "border-primary bg-primary text-white" : "border-line text-muted hover:bg-surface-low"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {INSPIRATION_TYPE_ICONS[t]}
                </span>
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Cameră (opțional)">
          <select className={inputCls} value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value={GENERAL_ROOM_VALUE}>General (fără cameră)</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Notiță (opțional)">
          <textarea
            className={`${inputCls} min-h-16 resize-y`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Ce îți place la ea, ce vrei să reții..."
            maxLength={300}
          />
        </Field>

        <Field label="Link sursă (opțional)">
          <input
            className={inputCls}
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://... (Pinterest, site arhitect etc.)"
          />
        </Field>
      </form>
    </Drawer>
  );
}
