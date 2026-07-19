"use client";

import { useState } from "react";
import Drawer from "@/components/Drawer";
import { Field, PrimaryButton, inputCls } from "@/components/forms";
import { MaterialType } from "@/shared/types";
import { useStore } from "@/shared/store";
import { useAsyncAction } from "@/shared/useAsyncAction";
import { GroupDrawerState } from "./GroupDrawerState";

const materialTypes = Object.values(MaterialType);

/** Adaugă/editează un grup de comparație (produs de decis pentru o cameră) — nu atinge ofertele lui. */
export default function GroupFormDrawer({
  state,
  onClose,
  defaultRoomId,
}: {
  state: GroupDrawerState;
  onClose: () => void;
  defaultRoomId?: string;
}) {
  const { rooms, addComparisonGroup, updateComparisonGroup } = useStore();
  const { open, group } = state;
  const editing = !!group;

  const [name, setName] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType>(MaterialType.Gresie);
  const [roomId, setRoomId] = useState("");

  // Resetează/populează formularul la fiecare deschidere — „adjusting state during render", nu useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(group?.name ?? "");
      setMaterialType(group?.materialType ?? MaterialType.Gresie);
      setRoomId(group?.roomId ?? defaultRoomId ?? rooms[0]?.id ?? "");
    }
  }

  const { run: submit, pending } = useAsyncAction(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !roomId) return;
    if (editing && group) {
      await updateComparisonGroup(group.id, { name, materialType, roomId });
    } else {
      await addComparisonGroup(roomId, { name, materialType });
    }
    onClose();
  });

  const formId = "comparison-group-form";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? "Editează Grup" : "Grup Nou de Comparație"}
      footer={
        <div className="space-y-3">
          <PrimaryButton type="submit" form={formId} pending={pending}>
            {editing ? "Salvează Modificările" : "Creează Grupul"}
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
        <Field label="Nume produs de comparat">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Gresie baie"
            required
          />
        </Field>

        <Field label="Cameră">
          <select className={inputCls} value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Categorie material">
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
      </form>
    </Drawer>
  );
}
