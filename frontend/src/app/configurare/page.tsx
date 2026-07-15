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
import { TECHNICAL_ICONS, DOCUMENT_ICONS } from "@/shared/icons";
import RoomTechnicalCard from "./RoomTechnicalCard";

export default function ConfigurarePage() {
  const { project, rooms, summary, updateProject } = useStore();
  const [roomDrawerOpen, setRoomDrawerOpen] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  // Sumarul tehnic vine din agregarea server-side (Problema 2 din audit), nu recalculat client-side.
  const technical = summary.technical;
  const progressPct = Math.round(technical.configuredRoomsRatio * 100);
  const status =
    progressPct === 0 ? "Neînceput" : progressPct === 100 ? "Finalizat" : "În Lucru";
  // Suprafață utilă afișată: valoarea manuală a proiectului dacă există, altfel suma camerelor configurate.
  const displayedArea = project.totalArea ?? technical.totalFloorArea;

  // Import dinamic — @react-pdf/renderer e destul de greu, nu are rost în bundle-ul inițial al paginii,
  // doar la apăsarea efectivă a butonului de export.
  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const [{ pdf }, { default: ApartmentPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./ApartmentPdfDocument"),
      ]);
      const blob = await pdf(
        <ApartmentPdfDocument project={project} rooms={rooms} technical={technical} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${project.title.replace(/[^\p{L}\p{N}]+/gu, "-")}-configurare-apartament.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingPdf(false);
    }
  };

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

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf || rooms.length === 0}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-primary hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">
              {exportingPdf ? TECHNICAL_ICONS.calculatedResults : DOCUMENT_ICONS.exportPdf}
            </span>
            {exportingPdf ? "Se generează..." : "Export PDF"}
          </button>
          <button
            type="button"
            onClick={() => setRoomDrawerOpen(true)}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          >
            + Adaugă Cameră
          </button>
        </div>

        {/* Listă camere cu configurare tehnică */}
        <section className="space-y-6">
          {rooms.map((room) => (
            <RoomTechnicalCard key={room.id} room={room} />
          ))}
        </section>
      </main>

      <RoomFormDrawer open={roomDrawerOpen} onClose={() => setRoomDrawerOpen(false)} />
    </div>
  );
}
