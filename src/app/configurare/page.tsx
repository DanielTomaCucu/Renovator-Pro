"use client";

import { useState } from "react";
import RoomFormDrawer from "@/components/RoomFormDrawer";
import PageHeader from "@/components/PageHeader";
import DashboardSummaryCard, {
  SummaryAccentFooter,
  SummaryProgressFooter,
} from "@/components/DashboardSummaryCard";
import { useStore } from "@/shared/store";
import { formatMoney } from "@/shared/functions";
import { TECHNICAL_ICONS } from "@/shared/icons";
import { projectTechnicalSummary } from "./dimensions";
import RoomTechnicalCard from "./RoomTechnicalCard";

export default function ConfigurarePage() {
  const { project, rooms, updateRoom } = useStore();
  const [roomDrawerOpen, setRoomDrawerOpen] = useState(false);
  const summary = projectTechnicalSummary(rooms);
  const progressPct = Math.round(summary.configuredRoomsRatio * 100);
  const status =
    progressPct === 0 ? "Neînceput" : progressPct === 100 ? "Finalizat" : "În Lucru";

  return (
    <div>
      <PageHeader title="Configurare Apartament" searchPlaceholder="Caută cameră..." />

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6 lg:px-10">
        {/* Sumar tehnic global — card unic cu gradient închis, identic pe mobil și desktop. */}
        <section className="space-y-3">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">
              Proiect Curent
            </p>
            <h2 className="font-heading text-xl font-bold">{project.title}</h2>
          </div>
          <DashboardSummaryCard
            metrics={[
              { label: "Suprafață Utilă", value: `${summary.totalFloorArea.toFixed(1)} mp` },
              {
                label: "Status",
                value: status,
                footer: <SummaryAccentFooter>Stadiu curent</SummaryAccentFooter>,
              },
              { label: "Buget Total", value: formatMoney(project.totalBudget) },
              {
                label: "Progres Calcul",
                value: `${progressPct}%`,
                footer: <SummaryProgressFooter percent={progressPct} color="secondary" />,
              },
            ]}
          />
        </section>

        {/* Listă camere cu configurare tehnică */}
        <section className="space-y-6">
          {rooms.map((room) => (
            <div key={room.id} className="space-y-2">
              <RoomTechnicalCard room={room} />
              <label className="flex items-center justify-between rounded-lg border border-line bg-surface px-5 py-3 text-sm text-muted">
                Buget alocat (€)
                <input
                  type="number"
                  min={0}
                  value={room.allocatedBudget}
                  onChange={(e) =>
                    updateRoom(room.id, { allocatedBudget: Number(e.target.value) })
                  }
                  className="w-32 rounded-md border border-line px-3 py-2 text-right font-mono text-sm text-foreground outline-none focus:border-secondary"
                />
              </label>
            </div>
          ))}

          {/* Adaugă cameră nouă — stare goală */}
          <button
            type="button"
            onClick={() => setRoomDrawerOpen(true)}
            className="group flex min-h-[160px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-line p-6 transition-all hover:border-secondary hover:bg-surface-low"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-low text-primary transition-all group-hover:bg-secondary group-hover:text-white">
              <span className="material-symbols-outlined text-3xl">
                {TECHNICAL_ICONS.addRoomEmpty}
              </span>
            </div>
            <span className="font-heading text-lg text-muted transition-colors group-hover:text-primary">
              Adaugă Cameră Nouă
            </span>
            <span className="mt-1 text-xs font-bold uppercase tracking-widest text-muted">
              Alege tipul: Dormitor, Bucătărie, Hol...
            </span>
          </button>
        </section>
      </main>

      <RoomFormDrawer open={roomDrawerOpen} onClose={() => setRoomDrawerOpen(false)} />
    </div>
  );
}
