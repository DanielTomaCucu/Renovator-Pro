/**
 * Skeleton unic pentru zona de conținut, afișat cât timp `StoreProvider` încarcă datele inițiale.
 * Un singur skeleton pentru toate paginile (nu unul per pagină): store-ul e global, datele se încarcă
 * o singură dată la montare, nu la fiecare navigare — toate cele 4 pagini au aceeași structură de sus
 * (header + card sumar întunecat + conținut), deci un skeleton comun acoperă cazul real. Titlul rămâne
 * un bloc pulse (nu titlul real) — sidebar-ul e vizibil lângă el și evidențiază deja ruta activă.
 */
export default function PageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Se încarcă datele proiectului"
      className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-10"
    >
      {/* Titlu pagină */}
      <div className="h-8 w-56 animate-pulse rounded-lg bg-line" />

      {/* Card sumar (echivalentul DashboardSummaryCard) */}
      <div
        className="grid grid-cols-2 gap-6 rounded-2xl p-6 sm:grid-cols-4"
        style={{ background: "linear-gradient(135deg, #1e293b 0%, #000000 100%)" }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-2.5 w-16 animate-pulse rounded bg-white/20" />
            <div className="h-5 w-20 animate-pulse rounded bg-white/30" />
          </div>
        ))}
      </div>

      {/* Blocuri de conținut */}
      <div className="h-40 animate-pulse rounded-xl border border-line bg-surface-low" />
      <div className="h-40 animate-pulse rounded-xl border border-line bg-surface-low" />
    </div>
  );
}
