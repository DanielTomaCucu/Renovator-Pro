"use client";

import { useState } from "react";
import Drawer from "./Drawer";
import { DecimalInput, Field, PrimaryButton, inputCls } from "./forms";
import { Item, ItemOrigin, ItemStatus, MaterialType } from "@/shared/types";
import { useStore } from "@/shared/store";
import { useAsyncAction } from "@/shared/useAsyncAction";
import { materialUnit } from "@/shared/functions";

const materialTypes = Object.values(MaterialType);
const statuses = Object.values(ItemStatus);

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
  const [status, setStatus] = useState<ItemStatus>(ItemStatus.InAsteptare);
  const [materialType, setMaterialType] = useState<MaterialType>(MaterialType.Altele);
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [room, setRoom] = useState(roomId ?? "");
  const [quantityError, setQuantityError] = useState<string | null>(null);

  // Resetează/populează formularul de fiecare dată când drawerul se deschide.
  // Pattern React: "adjusting state during render" (nu useEffect) —
  // evită randări în cascadă. Vezi https://react.dev/learn/you-might-not-need-an-effect
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(item?.name ?? "");
      setSource(item?.source ?? "");
      setStatus(item?.status ?? ItemStatus.InAsteptare);
      setMaterialType(item?.materialType ?? MaterialType.Altele);
      setQuantity(item ? String(item.quantity) : "1");
      setUnitPrice(item ? String(item.unitPrice) : "");
      setProductUrl(item?.productUrl ?? "");
      setImageUrl(item?.imageUrl ?? "");
      setRoom(item?.roomId ?? roomId ?? rooms[0]?.id ?? "");
      setQuantityError(null);
    }
  }

  const { run: submit, pending } = useAsyncAction(async (e: React.FormEvent) => {
    e.preventDefault();
    // Validare explicită în loc de coerciție silențioasă (`Number(quantity) || 1`) — un câmp gol sau
    // 0 arăta userului cantitatea 1 salvată fără nicio explicație. Acum blocăm submit-ul cu un mesaj clar.
    const parsedQuantity = Number(quantity);
    if (quantity.trim() === "" || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setQuantityError("Cantitatea trebuie să fie un număr strict pozitiv.");
      return;
    }
    setQuantityError(null);
    const data = {
      name,
      source,
      status,
      materialType,
      quantity: parsedQuantity,
      unitPrice: Number(unitPrice) || 0,
      productUrl: productUrl || undefined,
      imageUrl: imageUrl || undefined,
      roomId: room,
    };
    if (editing && item) await updateItem(item.id, data);
    else await addItem({ ...data, origin: ItemOrigin.Manual });
    onClose();
  });

  const formId = "item-form";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? "Editează Element" : "Adaugă Element Nou"}
      footer={
        <div className="space-y-3">
          {quantityError && <p className="text-xs font-bold text-tertiary">{quantityError}</p>}
          <PrimaryButton type="submit" form={formId} pending={pending}>
            {editing ? "Salvează Modificările" : "Adaugă Element"}
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
          <Field label={`Cantitate (${materialUnit(materialType)})`}>
            <DecimalInput placeholder="ex: 1" value={quantity} onChange={setQuantity} />
          </Field>
          <Field label="Preț unitar (€)">
            <DecimalInput placeholder="ex: 0.00" value={unitPrice} onChange={setUnitPrice} />
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
      </form>
    </Drawer>
  );
}
