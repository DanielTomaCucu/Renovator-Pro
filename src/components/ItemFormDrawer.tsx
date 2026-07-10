"use client";

import { useState } from "react";
import Drawer from "./Drawer";
import { Field, PrimaryButton, inputCls } from "./forms";
import { Item, ItemStatus, MaterialType } from "@/lib/types";
import { useStore } from "@/lib/store";

const materialTypes: MaterialType[] = [
  "Gresie",
  "Faianță",
  "Parchet",
  "Vopsea",
  "Sanitare",
  "Mobilă",
  "Electrocasnice",
  "Corpuri de iluminat",
  "Altele",
];

const statuses: ItemStatus[] = ["În așteptare", "Planificat", "Cumpărat"];

export default function ItemFormDrawer({
  open,
  onClose,
  roomId,
  item,
}: {
  open: boolean;
  onClose: () => void;
  roomId?: string;
  item?: Item | null;
}) {
  const { rooms, addItem, updateItem } = useStore();
  const editing = !!item;

  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<ItemStatus>("În așteptare");
  const [materialType, setMaterialType] = useState<MaterialType>("Altele");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [productUrl, setProductUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [room, setRoom] = useState(roomId ?? "");

  // Resetează/populează formularul de fiecare dată când drawerul se deschide.
  // Pattern React: "adjusting state during render" (nu useEffect) —
  // evită randări în cascadă. Vezi https://react.dev/learn/you-might-not-need-an-effect
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(item?.name ?? "");
      setSource(item?.source ?? "");
      setStatus(item?.status ?? "În așteptare");
      setMaterialType(item?.materialType ?? "Altele");
      setQuantity(item?.quantity ?? 1);
      setUnitPrice(item?.unitPrice ?? 0);
      setProductUrl(item?.productUrl ?? "");
      setImageUrl(item?.imageUrl ?? "");
      setRoom(item?.roomId ?? roomId ?? rooms[0]?.id ?? "");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name,
      source,
      status,
      materialType,
      quantity,
      unitPrice,
      productUrl: productUrl || undefined,
      imageUrl: imageUrl || undefined,
      roomId: room,
    };
    if (editing && item) updateItem(item.id, data);
    else addItem(data);
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? "Editează Element" : "Adaugă Element Nou"}
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nume element">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Numele produsului"
            required
          />
        </Field>

        <Field label="Cameră">
          <select
            className={inputCls}
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tip element">
          <select
            className={inputCls}
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value as MaterialType)}
          >
            {materialTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Magazin / Sursă">
            <input
              className={inputCls}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Ex: Dedeman"
            />
          </Field>
          <Field label="Status">
            <select
              className={inputCls}
              value={status}
              onChange={(e) => setStatus(e.target.value as ItemStatus)}
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Cantitate (buc)">
            <input
              type="number"
              min={1}
              className={`${inputCls} font-mono`}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </Field>
          <Field label="Preț unitar (€)">
            <input
              type="number"
              min={0}
              step="0.01"
              className={`${inputCls} font-mono`}
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
            />
          </Field>
        </div>

        <Field label="Link website produs">
          <input
            className={inputCls}
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <Field label="URL imagine">
          <input
            className={inputCls}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL-ul imaginii produsului"
          />
        </Field>

        <div className="pt-2 space-y-3">
          <PrimaryButton type="submit">
            {editing ? "Salvează Modificările" : "Adaugă Element"}
          </PrimaryButton>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-sm text-muted hover:text-foreground"
          >
            Anulează
          </button>
        </div>
      </form>
    </Drawer>
  );
}
