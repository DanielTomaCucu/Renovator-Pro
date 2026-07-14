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
  const { project, rooms, updateProject } = useStore();
  const [roomDrawerOpen, setRoomDrawerOpen] = useState(false);
  const summary = projectTechnicalSummary(rooms);
  const progressPct = Math.round(summary.configuredRoomsRatio * 100);
  const status =
    progressPct === 0 ? "Neînceput" : progressPct === 100 ? "Finalizat" : "În Lucru";
  // Suprafață utilă afișată: valoarea manuală a proiectului dacă există, altfel suma camerelor configurate.
  const displayedArea = project.totalArea ?? summary.totalFloorArea;

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
              { label: "Suprafață Utilă", value: `${displayedArea.toFixed(1)} mp` },
              {
                label: "Status",
                value: status,
                footer: <SummaryAccentFooter>Stadiu curent</SummaryAccentFooter>,
              },
              { label: "Buget Total", value: formatMoney(project.totalBudget, project.currency) },
              {
                label: "Progres Calcul",
                value: `${progressPct}%`,
                footer: <SummaryProgressFooter percent={progressPct} color="secondary" />,
              },
            ]}
          />
        </section>

        {/* Suprafață Totală Apartament — valoare manuală, sursa de adevăr pt. progresul de proiect */}
        <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-low text-primary">
              <span className="material-symbols-outlined">{TECHNICAL_ICONS.totalArea}</span>
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-primary">
                Suprafață Totală Apartament (MP)
              </h3>
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                <span className="material-symbols-outlined text-[12px]">
                  {TECHNICAL_ICONS.info}
                </span>
                Valoare utilizată pentru calculul progresului proiectului
              </p>
            </div>
          </div>
          <div className="w-full md:w-48">
            <input
              type="number"
              step="0.01"
              min={0}
              placeholder="0.00"
              value={project.totalArea ?? ""}
              onChange={(e) =>
                updateProject({ totalArea: e.target.value ? Number(e.target.value) : undefined })
              }
              className="w-full rounded-lg border border-line bg-surface px-4 py-3 font-mono text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
        </section>

        {/* Listă camere cu configurare tehnică */}
        <section className="space-y-6">
          {rooms.map((room) => (
            <RoomTechnicalCard key={room.id} room={room} />
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
