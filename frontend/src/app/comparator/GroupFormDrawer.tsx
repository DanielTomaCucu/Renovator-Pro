"use client";

import { useState } from "react";
import Drawer from "@/components/Drawer";
import { Field, PrimaryButton, inputCls } from "@/components/forms";
import { MaterialType } from "@/shared/types";
import { useStore } from "@/shared/store";
import { useAsyncAction } from "@/shared/useAsyncAction";
import { ACTION_ICONS } from "@/shared/icons";
import { GroupDrawerState } from "./GroupDrawerState";
import { configuredItemCandidates } from "./configuredItemCandidates";

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
  const { rooms, items, addComparisonGroup, updateComparisonGroup } = useStore();
  const { open, group } = state;
  const editing = !!group;

  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [materialType, setMaterialType] = useState<MaterialType>(MaterialType.Gresie);
  const [roomId, setRoomId] = useState("");
  const [selectedLinkedItemId, setSelectedLinkedItemId] = useState("");

  // Resetează/populează formularul la fiecare deschidere — „adjusting state during render", nu useEffect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(group?.name ?? "");
      setNameTouched(false);
      setMaterialType(group?.materialType ?? MaterialType.Gresie);
      setRoomId(group?.roomId ?? defaultRoomId ?? rooms[0]?.id ?? "");
    }
  }

  // Ținta legăturii cu Configurare (docs/cerinte-comparator-config-sync.md) — recalculată de fiecare dată
  // când cameră/categorie se schimbă în formular, ca userul să vadă live ce element va fi completat.
  const candidates = configuredItemCandidates(items, roomId, materialType);
  const candidatesKey = candidates.map((c) => c.id).join(",");
  const [prevCandidatesKey, setPrevCandidatesKey] = useState<string | null>(null);
  if (candidatesKey !== prevCandidatesKey) {
    setPrevCandidatesKey(candidatesKey);
    const preferredId = group?.linkedItemId && candidates.some((c) => c.id === group.linkedItemId)
      ? group.linkedItemId
      : candidates[0]?.id ?? "";
    setSelectedLinkedItemId(preferredId);
    if (candidates.length === 1 && !nameTouched && !editing) {
      setName(candidates[0].name);
    }
  }

  const { run: submit, pending } = useAsyncAction(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !roomId) return;
    // linkedItemId explicit se trimite DOAR la ambiguitate (≥2 candidați) — cu 0/1 candidat, rezolvarea
    // automată din backend ajunge la același rezultat.
    const linkedItemId = candidates.length >= 2 ? selectedLinkedItemId || undefined : undefined;
    if (editing && group) {
      await updateComparisonGroup(group.id, { name, materialType, roomId, linkedItemId });
    } else {
      await addComparisonGroup(roomId, { name, materialType, linkedItemId });
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
            onChange={(e) => {
              setName(e.target.value);
              setNameTouched(true);
            }}
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

        {candidates.length === 0 && (
          <p className="rounded-lg bg-surface-low px-3 py-2.5 text-xs text-muted">
            Nu există element din configurare pentru această categorie — la alegerea unei oferte se va
            crea un element nou în Elemente de Cumpărat.
          </p>
        )}

        {candidates.length === 1 && (
          <div className="flex items-start gap-2 rounded-lg bg-surface-low px-3 py-2.5 text-xs text-muted">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: 16 }}>
              {ACTION_ICONS.link}
            </span>
            <span>
              La alegerea unei oferte se va completa elementul{" "}
              <strong className="text-primary">«{candidates[0].name}»</strong> — {candidates[0].quantity}{" "}
              din configurare (preț, magazin, link, poză). Cantitatea rămâne cea calculată din măsurători.
            </span>
          </div>
        )}

        {candidates.length >= 2 && (
          <Field label="Ce element din configurare completează acest grup?">
            <select
              className={inputCls}
              value={selectedLinkedItemId}
              onChange={(e) => setSelectedLinkedItemId(e.target.value)}
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.quantity}
                </option>
              ))}
            </select>
          </Field>
        )}
      </form>
    </Drawer>
  );
}
