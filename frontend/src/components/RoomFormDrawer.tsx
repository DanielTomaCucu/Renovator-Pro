"use client";

import { useState } from "react";
import Drawer from "./Drawer";
import { Field, PrimaryButton, inputCls } from "./forms";
import { RoomType } from "@/shared/types";
import { useStore } from "@/shared/store";

// TODO (backlog CLAUDE.md #2): înlocuit cu ROOM_TYPE_ICONS (Material Symbols)
// din "@/shared/icons" când fontul Material Symbols e încărcat în layout.tsx.
const ROOM_TYPE_EMOJI: Record<RoomType, string> = {
  [RoomType.Dormitor]: "🛏️",
  [RoomType.Baie]: "🛁",
  [RoomType.Living]: "🛋️",
  [RoomType.Bucatarie]: "🍳",
  [RoomType.Terasa]: "🌿",
  [RoomType.Balcon]: "🪟",
};

const roomTypes = Object.values(RoomType);

export default function RoomFormDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addRoom } = useStore();
  const [type, setType] = useState<RoomType>(RoomType.Dormitor);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");

  // Resetează formularul de fiecare dată când drawerul se deschide.
  // Pattern React: "adjusting state during render" (nu useEffect) —
  // evită randări în cascadă. Vezi https://react.dev/learn/you-might-not-need-an-effect
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setType(RoomType.Dormitor);
      setName("");
      setBudget("");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addRoom({ type, name, allocatedBudget: Number(budget) || 0 });
    onClose();
  }

  const formId = "room-form";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Adaugă Cameră Nouă"
      footer={
        <div className="space-y-3">
          <PrimaryButton type="submit" form={formId}>
            Salvează Camera
          </PrimaryButton>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-sm text-muted hover:text-foreground"
          >
            Anulează
          </button>
        </div>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-4">
        <Field label="Tip cameră">
          <div className="grid grid-cols-3 gap-2">
            {roomTypes.map((rt) => (
              <button
                key={rt}
                type="button"
                onClick={() => setType(rt)}
                className={`flex flex-col items-center gap-1 rounded-md border px-2 py-3 text-xs font-medium ${
                  type === rt
                    ? "border-primary bg-surface-low"
                    : "border-line hover:bg-surface-low"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {ROOM_TYPE_EMOJI[rt]}
                </span>
                {rt}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Nume cameră">
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Dormitor Oaspeți"
            required
          />
        </Field>

        <Field label="Buget alocat (€)">
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="ex: 1200"
            className={`${inputCls} font-mono`}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </Field>
      </form>
    </Drawer>
  );
}
