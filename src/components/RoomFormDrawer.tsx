"use client";

import { useEffect, useState } from "react";
import Drawer from "./Drawer";
import { Field, PrimaryButton, inputCls } from "./forms";
import { RoomType } from "@/lib/types";
import { useStore } from "@/lib/store";

const roomTypes: { type: RoomType; icon: string }[] = [
  { type: "Dormitor", icon: "🛏️" },
  { type: "Baie", icon: "🛁" },
  { type: "Living", icon: "🛋️" },
  { type: "Bucătărie", icon: "🍳" },
  { type: "Terasă", icon: "🌿" },
  { type: "Balcon", icon: "🪟" },
];

export default function RoomFormDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addRoom } = useStore();
  const [type, setType] = useState<RoomType>("Dormitor");
  const [name, setName] = useState("");
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    if (!open) return;
    setType("Dormitor");
    setName("");
    setBudget(0);
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addRoom({ type, name, allocatedBudget: budget });
    onClose();
  }

  return (
    <Drawer open={open} onClose={onClose} title="Adaugă Cameră Nouă">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Tip cameră">
          <div className="grid grid-cols-3 gap-2">
            {roomTypes.map((rt) => (
              <button
                key={rt.type}
                type="button"
                onClick={() => setType(rt.type)}
                className={`flex flex-col items-center gap-1 rounded-md border px-2 py-3 text-xs font-medium ${
                  type === rt.type
                    ? "border-primary bg-surface-low"
                    : "border-line hover:bg-surface-low"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {rt.icon}
                </span>
                {rt.type}
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
            className={`${inputCls} font-mono`}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
          />
        </Field>

        <div className="pt-2 space-y-3">
          <PrimaryButton type="submit">Salvează Camera</PrimaryButton>
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
