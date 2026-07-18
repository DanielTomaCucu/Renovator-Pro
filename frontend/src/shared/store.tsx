"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Currency, Item, Project, ProjectSummary, RenovationStore, Room, SpendingTimelinePoint } from "./types";
import { api } from "./api-client";
import { useAuth } from "./AuthProvider";
import PageSkeleton from "@/components/PageSkeleton";

const StoreContext = createContext<RenovationStore | null>(null);

/** Extrage un mesaj afișabil dintr-o eroare de fetch/API — `ApiError` are `.message` util, restul nu. */
function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "A apărut o eroare neașteptată. Încearcă din nou.";
}

/**
 * Store conectat la backend-ul real: mutațiile apelează API-ul, apoi actualizează starea locală din
 * răspuns. `summary`/`spendingTimeline` (agregările server-side) sunt reîncărcate după FIECARE mutație —
 * sursa de adevăr pentru totalurile/graficele din headere, ca paginile să nu recalculeze aceleași reguli
 * client-side (Problema 2 din audit).
 *
 * Toate mutațiile sunt `async`, împachetate în try/catch: dacă requestul eșuează (rețea, validare 4xx,
 * server jos), starea locală NU se schimbă și mesajul ajunge în `error` — altfel eșecul trecea neobservat
 * (UI-ul arăta „Salvat” chiar dacă nimic nu s-a persistat).
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  if (!session) {
    // AppShell randează StoreProvider DOAR când sesiunea există (vezi components/AppShell.tsx) —
    // ajungerea aici ar însemna o eroare de wiring, nu o stare validă de tratat grațios.
    throw new Error("StoreProvider randat fără sesiune activă");
  }
  const projectId = session.project.id;

  const [project, setProject] = useState<Project | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [spendingTimeline, setSpendingTimeline] = useState<SpendingTimelinePoint[] | null>(null);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const dismissError = useCallback(() => setError(null), []);

  const reloadAggregates = useCallback(async () => {
    const [s, t] = await Promise.all([
      api.get<ProjectSummary>(`/api/projects/${projectId}/summary`),
      api.get<SpendingTimelinePoint[]>(`/api/projects/${projectId}/spending-timeline`),
    ]);
    setSummary(s);
    setSpendingTimeline(t);
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get<Project>(`/api/projects/${projectId}`),
      api.get<Room[]>(`/api/projects/${projectId}/rooms`),
      api.get<Item[]>(`/api/projects/${projectId}/items`),
      api.get<ProjectSummary>(`/api/projects/${projectId}/summary`),
      api.get<SpendingTimelinePoint[]>(`/api/projects/${projectId}/spending-timeline`),
    ])
      .then(([p, r, i, s, t]) => {
        if (cancelled) return;
        setProject(p);
        setRooms(r);
        setItems(i);
        setSummary(s);
        setSpendingTimeline(t);
      })
      .catch((err) => {
        if (cancelled) return;
        setInitialLoadError(toErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [loadAttempt, projectId]);

  const retryInitialLoad = useCallback(() => {
    setInitialLoadError(null);
    setLoadAttempt((n) => n + 1);
  }, []);

  const updateProject = useCallback(
    async (patch: Partial<Project>) => {
      try {
        const updated = await api.patch<Project>(`/api/projects/${projectId}`, patch);
        setProject(updated);
        await reloadAggregates();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [projectId, reloadAggregates]
  );

  const convertCurrency = useCallback(
    async (targetCurrency: Currency, exchangeRate: number) => {
      // Conversia atinge project + toate camerele + toate elementele — reîncărcăm snapshot-ul complet
      // (inclusiv agregările) ca fiecare pagină/header să reflecte sumele convertite.
      try {
        const updated = await api.post<Project>(`/api/projects/${projectId}/currency`, {
          targetCurrency,
          exchangeRate,
        });
        setProject(updated);
        const [r, i] = await Promise.all([
          api.get<Room[]>(`/api/projects/${projectId}/rooms`),
          api.get<Item[]>(`/api/projects/${projectId}/items`),
        ]);
        setRooms(r);
        setItems(i);
        await reloadAggregates();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [projectId, reloadAggregates]
  );

  const addRoom = useCallback(
    async (room: Omit<Room, "id">) => {
      try {
        const created = await api.post<Room>(`/api/projects/${projectId}/rooms`, room);
        setRooms((prev) => [...prev, created]);
        await reloadAggregates();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [projectId, reloadAggregates]
  );

  const updateRoom = useCallback(
    async (id: string, patch: { [K in keyof Room]?: Room[K] | null }) => {
      try {
        const updated = await api.patch<Room>(`/api/rooms/${id}`, patch);
        setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
        // Câmpurile tehnice pot declanșa reconcilierea elementelor auto-generate pe server — reîncărcăm
        // lista de elemente ca să reflectăm exact ce a calculat backend-ul (adaugă/recalculează/șterge).
        const freshItems = await api.get<Item[]>(`/api/projects/${projectId}/items`);
        setItems(freshItems);
        await reloadAggregates();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [projectId, reloadAggregates]
  );

  const deleteRoom = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/rooms/${id}`);
        setRooms((prev) => prev.filter((r) => r.id !== id));
        setItems((prev) => prev.filter((i) => i.roomId !== id));
        await reloadAggregates();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [reloadAggregates]
  );

  const addItem = useCallback(
    async (item: Omit<Item, "id" | "createdAt" | "purchasedAt">) => {
      try {
        const created = await api.post<Item>(`/api/rooms/${item.roomId}/items`, item);
        setItems((prev) => [...prev, created]);
        await reloadAggregates();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [reloadAggregates]
  );

  const updateItem = useCallback(
    async (id: string, patch: Partial<Item>) => {
      try {
        const updated = await api.patch<Item>(`/api/items/${id}`, patch);
        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
        await reloadAggregates();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [reloadAggregates]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/items/${id}`);
        setItems((prev) => prev.filter((i) => i.id !== id));
        await reloadAggregates();
      } catch (err) {
        setError(toErrorMessage(err));
      }
    },
    [reloadAggregates]
  );

  const value = useMemo<RenovationStore | null>(
    () =>
      project && summary && spendingTimeline
        ? {
            project,
            rooms,
            items,
            summary,
            spendingTimeline,
            error,
            dismissError,
            updateProject,
            convertCurrency,
            addRoom,
            updateRoom,
            deleteRoom,
            addItem,
            updateItem,
            deleteItem,
          }
        : null,
    [
      project,
      rooms,
      items,
      summary,
      spendingTimeline,
      error,
      dismissError,
      updateProject,
      convertCurrency,
      addRoom,
      updateRoom,
      deleteRoom,
      addItem,
      updateItem,
      deleteItem,
    ]
  );

  if (initialLoadError) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-background px-6 py-16 text-center">
        <span className="material-symbols-outlined text-4xl text-tertiary">error_outline</span>
        <p className="max-w-sm text-sm text-muted">
          Nu am putut încărca datele proiectului: {initialLoadError}
        </p>
        <button
          type="button"
          onClick={retryInitialLoad}
          className="rounded-lg bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-transform hover:opacity-90 active:scale-[0.98]"
        >
          Reîncearcă
        </button>
      </div>
    );
  }

  if (!value) {
    return <PageSkeleton />;
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-tertiary/30 bg-primary px-4 py-3 text-white shadow-xl">
          <span className="material-symbols-outlined mt-0.5 text-[18px] text-tertiary">error_outline</span>
          <p className="flex-1 text-sm">{error}</p>
          <button
            type="button"
            onClick={dismissError}
            aria-label="Închide mesajul de eroare"
            className="material-symbols-outlined text-[18px] text-white/70 hover:text-white"
          >
            close
          </button>
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
