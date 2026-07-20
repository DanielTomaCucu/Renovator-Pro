"use client";

import { useState } from "react";
import Drawer from "@/components/Drawer";
import Spinner from "@/components/Spinner";
import { Field, PrimaryButton, inputCls } from "@/components/forms";
import { useStore } from "@/shared/store";
import { useAsyncAction } from "@/shared/useAsyncAction";
import { ACTION_ICONS, COMPARATOR_ICONS } from "@/shared/icons";
import { OfferDrawerState } from "./OfferDrawerState";
import { compressImage } from "./compressImage";
import { detectStoreName } from "./detectStore";

const MAX_IMAGES = 8;

export default function OfferFormDrawer({
  state,
  groupId,
  onClose,
}: {
  state: OfferDrawerState;
  groupId: string;
  onClose: () => void;
}) {
  const { addOffer, updateOffer } = useStore();
  const { open, offer } = state;
  const editing = !!offer;

  const [name, setName] = useState("");
  const [store, setStore] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectHint, setDetectHint] = useState<string | null>(null);

  // Resetează/populează formularul la fiecare deschidere — „adjusting state during render", nu useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(offer?.name ?? "");
      setStore(offer?.store ?? "");
      setUnitPrice(offer?.unitPrice !== undefined ? String(offer.unitPrice) : "");
      setQuantity(offer?.quantity !== undefined ? String(offer.quantity) : "");
      setProductUrl(offer?.productUrl ?? "");
      setNotes(offer?.notes ?? "");
      setImages(offer?.images ?? []);
      setImageUrlInput("");
      setDetectHint(null);
    }
  }

  async function handlePhotoFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setCompressing(true);
    try {
      for (const file of files) {
        if (images.length >= MAX_IMAGES) break;
        const compressed = await compressImage(file);
        setImages((prev) => (prev.length >= MAX_IMAGES ? prev : [...prev, compressed]));
      }
    } finally {
      setCompressing(false);
    }
  }

  function addImageUrl() {
    const url = imageUrlInput.trim();
    if (!url || images.length >= MAX_IMAGES) return;
    setImages((prev) => [...prev, url]);
    setImageUrlInput("");
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDetectStore() {
    setDetecting(true);
    setDetectHint(null);
    try {
      const detected = await detectStoreName();
      if (detected) setStore(detected);
      else setDetectHint("Nu am putut detecta magazinul");
    } finally {
      setDetecting(false);
    }
  }

  const { run: submit, pending } = useAsyncAction(async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: name || undefined,
      store: store || undefined,
      unitPrice: unitPrice ? Number(unitPrice) : undefined,
      quantity: quantity ? Number(quantity) : undefined,
      productUrl: productUrl || undefined,
      images,
      notes: notes || undefined,
    };
    if (editing && offer) await updateOffer(offer.id, data);
    else await addOffer(groupId, data);
    onClose();
  });

  const formId = "offer-form";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? "Editează Ofertă" : "Adaugă Ofertă"}
      footer={
        <div className="space-y-3">
          <PrimaryButton type="submit" form={formId} pending={pending}>
            {editing ? "Salvează Modificările" : "Adaugă Oferta"}
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
        {/* Poze — primul câmp, cel mai proeminent: fluxul principal e „fac poze acum, completez restul acasă". */}
        <Field label={`Poze (${images.length}/${MAX_IMAGES})`}>
          <div className="space-y-2">
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div key={i} className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Poză ${i + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label="Șterge poza"
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined icon-btn">{ACTION_ICONS.delete}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length < MAX_IMAGES && (
              <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface-low p-3 text-[12px] font-bold text-muted transition-colors hover:border-secondary hover:text-secondary active:scale-[0.98]">
                {compressing ? <Spinner /> : (
                  <span className="material-symbols-outlined icon-btn">{COMPARATOR_ICONS.addPhoto}</span>
                )}
                {compressing ? "Se procesează..." : "Fă / alege poze"}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  disabled={compressing}
                  onChange={handlePhotoFiles}
                  className="hidden"
                />
              </label>
            )}
            {images.length < MAX_IMAGES && (
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="sau lipește un URL de poză"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  disabled={!imageUrlInput.trim()}
                  className="shrink-0 rounded-md border border-line px-3 text-xs font-bold text-muted hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Adaugă
                </button>
              </div>
            )}
          </div>
        </Field>

        <Field label="Nume / model (opțional)">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Gresie Cesarom Tivoli 60×60"
          />
        </Field>

        <Field label="Magazin (opțional)">
          <div className="flex gap-2">
            <input
              className={`${inputCls} flex-1`}
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Ex: Dedeman"
            />
            <button
              type="button"
              onClick={handleDetectStore}
              disabled={detecting}
              title="Detectează magazinul din locația curentă"
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-line px-2.5 text-xs font-bold text-muted hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-50"
            >
              {detecting ? <Spinner /> : <span className="material-symbols-outlined icon-btn">{COMPARATOR_ICONS.detectStore}</span>}
            </button>
          </div>
          {detectHint && <p className="mt-1 text-[11px] text-muted">{detectHint}</p>}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Preț unitar (opțional)">
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="ex: 45.00"
              className={`${inputCls} font-mono`}
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </Field>
          <Field label="Cantitate (opțional)">
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="ex: 1"
              className={`${inputCls} font-mono`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Link produs (opțional)">
          <input
            className={inputCls}
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <Field label="Notițe (opțional)">
          <textarea
            className={`${inputCls} min-h-20 resize-y`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Pro/contra, observații..."
          />
        </Field>
      </form>
    </Drawer>
  );
}
