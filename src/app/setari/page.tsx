"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useStore } from "@/shared/store";
import { Currency } from "@/shared/types";
import { ACTION_ICONS, SETTINGS_ICONS, TECHNICAL_ICONS } from "@/shared/icons";

const CURRENCY_LABEL: Record<Currency, string> = {
  [Currency.RON]: "Lei (RON)",
  [Currency.EUR]: "Euro (EUR)",
};

/** Istoric exemplu — decorativ, nu există încă o sursă reală de curs valutar (backlog item 6, CLAUDE.md). */
const EXCHANGE_RATE_HISTORY = [
  { date: "01.10.2025", rate: "4.9752 RON" },
  { date: "15.09.2025", rate: "4.9680 RON" },
];

export default function SetariPage() {
  const { project, updateProject } = useStore();
  const [pendingCurrency, setPendingCurrency] = useState(project.currency);
  const [exchangeRate, setExchangeRate] = useState("4.97");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProject({ currency: pendingCurrency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Setări Proiect" showSearch={false} />

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6 lg:px-10">
        <div className="md:hidden">
          <h2 className="font-heading text-xl font-bold text-primary">Setări Proiect</h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* Configurare Monedă */}
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm lg:col-span-2">
            <div className="border-b border-line bg-surface-low/50 p-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {SETTINGS_ICONS.currencyExchange}
                </span>
                <h3 className="font-heading text-lg font-bold text-primary">Configurare Monedă</h3>
              </div>
              <p className="text-sm text-muted">
                Selectează moneda principală pentru raportare și calculele bugetare.
              </p>
            </div>

            <div className="space-y-6 p-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted">
                  Moneda de bază
                </label>
                <div className="flex w-fit gap-1 rounded-lg border border-line bg-surface-low p-1">
                  {Object.values(Currency).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPendingCurrency(c)}
                      className={`rounded-md px-5 py-2.5 text-sm font-bold transition-all ${
                        pendingCurrency === c
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted hover:bg-surface"
                      }`}
                    >
                      {CURRENCY_LABEL[c].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {pendingCurrency === Currency.EUR && (
                <div className="max-w-xs space-y-2">
                  <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted">
                    Curs Valutar (1 EUR = ... RON)
                    <span
                      className="material-symbols-outlined text-[14px] text-muted"
                      title="Folosit pentru conversia automată a ofertelor în RON"
                    >
                      {TECHNICAL_ICONS.info}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="4.97"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-full rounded-lg border border-line bg-surface-low px-4 py-3 font-mono text-sm text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-muted">
                      RON
                    </span>
                  </div>
                  <p className="text-xs italic text-muted">
                    Cursul este utilizat pentru sincronizarea automată a costurilor de la
                    furnizori externi.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-line p-6">
              {saved && <span className="text-xs font-bold text-secondary">Salvat ✓</span>}
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-transform hover:opacity-90 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">{ACTION_ICONS.save}</span>
                Salvează Setările
              </button>
            </div>
          </div>

          {/* Panou lateral: informativ + istoric curs */}
          <div className="space-y-6">
            <div className="rounded-xl border border-primary bg-primary p-6 text-white">
              <h4 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">
                  {SETTINGS_ICONS.verifiedUser}
                </span>
                De Reținut
              </h4>
              <p className="text-sm leading-relaxed text-white/80">
                Schimbarea monedei de raportare nu modifică valorile introduse deja, ci doar
                modul în care sunt afișate totalurile în tabloul de bord. Recomandăm stabilirea
                monedei la începutul proiectului.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              <div className="flex h-24 items-center justify-center bg-surface-low">
                <span className="material-symbols-outlined text-4xl text-muted">
                  {TECHNICAL_ICONS.projectEfficiency}
                </span>
              </div>
              <div className="p-4">
                <h5 className="mb-2 text-[10px] font-bold uppercase text-muted">Istoric Curs</h5>
                <ul className="space-y-1.5 font-mono text-[11px] text-muted">
                  {EXCHANGE_RATE_HISTORY.map((entry) => (
                    <li
                      key={entry.date}
                      className="flex justify-between border-b border-line/50 pb-1.5"
                    >
                      <span>{entry.date}</span>
                      <span className="font-bold text-primary">{entry.rate}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[10px] italic text-muted">
                  Exemplu — istoric real, neimplementat încă (necesită sursă de curs valutar).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
