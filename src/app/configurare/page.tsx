"use client";

import { useState } from "react";
import RoomFormDrawer from "@/components/RoomFormDrawer";
import { useStore } from "@/lib/store";
import { formatMoney } from "@/lib/functions";

export default function ConfigurarePage() {
  const { project, rooms, updateRoom } = useStore();
  const [roomDrawerOpen, setRoomDrawerOpen] = useState(false);

  return (
    <div className="px-6 py-6 lg:px-10 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">
          Configurare Apartament
        </h1>
        <button
          onClick={() => setRoomDrawerOpen(true)}
          className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          + Adaugă Cameră
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-surface p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">
          Proiect
        </p>
        <h2 className="mt-1 font-heading text-xl font-semibold">
          {project.title}
        </h2>
        <p className="mt-1 font-mono text-muted">
          Buget total: {formatMoney(project.totalBudget)}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex items-center justify-between rounded-lg border border-line bg-surface px-5 py-4"
          >
            <div>
              <p className="font-medium">{room.name}</p>
              <p className="text-xs uppercase font-bold tracking-wide text-muted">
                {room.type}
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              Buget alocat (€)
              <input
                type="number"
                min={0}
                value={room.allocatedBudget}
                onChange={(e) =>
                  updateRoom(room.id, {
                    allocatedBudget: Number(e.target.value),
                  })
                }
                className="w-32 rounded-md border border-line px-3 py-2 text-right font-mono text-sm text-foreground outline-none focus:border-secondary"
              />
            </label>
          </div>
        ))}
      </div>

      <RoomFormDrawer
        open={roomDrawerOpen}
        onClose={() => setRoomDrawerOpen(false)}
      />
    </div>
  );
}
