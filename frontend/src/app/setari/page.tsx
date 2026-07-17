"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import Spinner from "@/components/Spinner";
import { useStore } from "@/shared/store";
import { useAsyncAction } from "@/shared/useAsyncAction";
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
  const { project, updateProject, convertCurrency } = useStore();

  // Titlu + Buget Total — needitabile până acum (Problema 5 din audit): pe date reale (backend),
  // proiectul seedat are titlu generic și buget 0, ceea ce sparge toate calculele de buget din /analiza.
  const [title, setTitle] = useState(project.title);
  const [prevTitle, setPrevTitle] = useState(project.title);
  if (project.title !== prevTitle) {
    setPrevTitle(project.title);
    setTitle(project.title);
  }
  const [totalBudget, setTotalBudget] = useState(String(project.totalBudget));
  const [prevTotalBudget, setPrevTotalBudget] = useState(project.totalBudget);
  if (project.totalBudget !== prevTotalBudget) {
    setPrevTotalBudget(project.totalBudget);
    setTotalBudget(String(project.totalBudget));
  }
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsSaved, setDetailsSaved] = useState(false);

  const { run: handleSaveDetails, pending: detailsPending } = useAsyncAction(async () => {
    const trimmedTitle = title.trim();
    const budget = Number(totalBudget);
    if (!trimmedTitle) {
      setDetailsError("Titlul proiectului nu poate fi gol.");
      return;
    }
    if (!Number.isFinite(budget) || budget < 0) {
      setDetailsError("Bugetul total trebuie să fie un număr nenegativ.");
      return;
    }
    setDetailsError(null);
    // Așteptăm requestul (store-ul înghite eroarea de rețea/validare în `error` global) — „Salvat ✓"
    // apare doar după ce mutația chiar s-a terminat, nu imediat la click.
    await updateProject({ title: trimmedTitle, totalBudget: budget });
    setDetailsSaved(true);
    setTimeout(() => setDetailsSaved(false), 2000);
  });

  const [pendingCurrency, setPendingCurrency] = useState(project.currency);
  // `project.currency` poate fi actualizat asincron la montare (store-ul citește din localStorage
  // într-un efect propriu, după primul render) — sincronizăm starea locală „pending" fără useEffect,
  // comparând cu valoarea anterioară ținută în state (pattern „adjusting state during render", vezi
  // ItemFormDrawer/RoomFormDrawer pt. exemplul original al regulii din CLAUDE.md).
  const [prevCurrency, setPrevCurrency] = useState(project.currency);
  if (project.currency !== prevCurrency) {
    setPrevCurrency(project.currency);
    setPendingCurrency(project.currency);
  }
  const [exchangeRate, setExchangeRate] = useState("4.97");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conversie necesară doar când moneda țintă diferă de cea curentă a proiectului.
  const conversionNeeded = pendingCurrency !== project.currency;

  const { run: handleSave, pending: currencyPending } = useAsyncAction(async () => {
    if (!conversionNeeded) {
      // Nimic de convertit — moneda e deja cea selectată. Fără request, deci fără spinner.
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }
    const rate = Number(exchangeRate);
    if (!Number.isFinite(rate) || rate <= 0) {
      setError("Introdu un curs valutar valid (strict pozitiv) înainte de conversie.");
      return;
    }
    setError(null);
    // Conversie REALĂ: recalculează toate sumele (buget, camere, elemente) pe backend, apoi
    // reîncarcă snapshot-ul — vezi convertCurrency din store.tsx. Așteptăm requestul înainte de
    // a arăta „Conversie aplicată ✓" (altfel apărea și dacă requestul eșua).
    await convertCurrency(pendingCurrency, rate);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  });

  return (
    <div>
      <PageHeader title="Setări Proiect" showSearch={false} />

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6 lg:px-10">
        <div className="md:hidden">
          <h2 className="font-heading text-xl font-bold text-primary">Setări Proiect</h2>
        </div>

        {/* Detalii Proiect — titlu + buget total, editabile (Problema 5 din audit). */}
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <div className="border-b border-line bg-surface-low/50 p-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                {SETTINGS_ICONS.verifiedUser}
              </span>
              <h3 className="font-heading text-lg font-bold text-primary">Detalii Proiect</h3>
            </div>
            <p className="text-sm text-muted">
              Titlul și bugetul total al proiectului — folosite peste tot în „Analiză Bugetară” și
              „Tabel Centralizator” (buget rămas, procent depășire, progres).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted">Titlu proiect</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Renovare Apartament Centru"
                className="w-full rounded-lg border border-line bg-surface-low px-4 py-3 text-sm text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted">
                Buget total ({project.currency})
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="ex: 12500"
                className="w-full rounded-lg border border-line bg-surface-low px-4 py-3 font-mono text-sm text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-line p-6">
            {detailsError && <span className="mr-auto text-xs font-bold text-tertiary">{detailsError}</span>}
            {detailsSaved && <span className="text-xs font-bold text-secondary">Salvat ✓</span>}
            <button
              type="button"
              onClick={handleSaveDetails}
              disabled={detailsPending}
              aria-busy={detailsPending}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-transform hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {detailsPending ? (
                <Spinner />
              ) : (
                <span className="material-symbols-outlined text-[18px]">{ACTION_ICONS.save}</span>
              )}
              Salvează Detaliile
            </button>
          </div>
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

              {conversionNeeded && (
                <div className="max-w-xs space-y-2">
                  <label className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted">
                    Curs Valutar (1 EUR = ... RON)
                    <span
                      className="material-symbols-outlined text-[14px] text-muted"
                      title="Folosit pentru conversia tuturor sumelor între EUR și RON"
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
                    La salvare, {pendingCurrency === Currency.RON ? "sumele în EUR se înmulțesc" : "sumele în RON se împart"}{" "}
                    cu acest curs. Se convertesc toate valorile: buget total, buget pe camere și prețurile elementelor.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-line p-6">
              {error && <span className="mr-auto text-xs font-bold text-tertiary">{error}</span>}
              {saved && (
                <span className="text-xs font-bold text-secondary">
                  {conversionNeeded ? "Conversie aplicată ✓" : "Salvat ✓"}
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={currencyPending}
                aria-busy={currencyPending}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-white transition-transform hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {currencyPending ? (
                  <Spinner />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">{ACTION_ICONS.save}</span>
                )}
                {conversionNeeded ? "Convertește și Salvează" : "Salvează Setările"}
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
                Schimbarea monedei convertește efectiv toate sumele proiectului (buget total, buget
                pe camere și prețurile elementelor) la cursul introdus. Conversia este distructivă —
                dus-întors repetat pierde precizie prin rotunjire — deci stabilește moneda la
                începutul proiectului și schimb-o rar.
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
