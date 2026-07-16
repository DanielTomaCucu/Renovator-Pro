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
import { Currency, Item, Project, ProjectSummary, RenovationStore, Room } from "./types";
import { api, DEFAULT_PROJECT_ID } from "./api-client";

const StoreContext = createContext<RenovationStore | null>(null);

/**
 * Store conectat la backend-ul real: mutațiile apelează API-ul, apoi actualizează starea locală din
 * răspuns. `summary` (agregările server-side) e reîncărcat după FIECARE mutație — sursa de adevăr pentru
 * totalurile din headere/grafice, ca paginile să nu recalculeze aceleași reguli client-side (Problema 2).
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [summary, setSummary] = useState<ProjectSummary | null>(null);

  const reloadSummary = useCallback(
    () =>
      api
        .get<ProjectSummary>(`/api/projects/${DEFAULT_PROJECT_ID}/summary`)
        .then(setSummary),
    []
  );

  useEffect(() => {
    Promise.all([
      api.get<Project>(`/api/projects/${DEFAULT_PROJECT_ID}`),
      api.get<Room[]>(`/api/projects/${DEFAULT_PROJECT_ID}/rooms`),
      api.get<Item[]>(`/api/projects/${DEFAULT_PROJECT_ID}/items`),
      api.get<ProjectSummary>(`/api/projects/${DEFAULT_PROJECT_ID}/summary`),
    ]).then(([p, r, i, s]) => {
      setProject(p);
      setRooms(r);
      setItems(i);
      setSummary(s);
    });
  }, []);

  const updateProject = useCallback(
    (patch: Partial<Project>) => {
      api.patch<Project>(`/api/projects/${DEFAULT_PROJECT_ID}`, patch).then((updated) => {
        setProject(updated);
        reloadSummary();
      });
    },
    [reloadSummary]
  );

  const convertCurrency = useCallback(
    (targetCurrency: Currency, exchangeRate: number) => {
      // Conversia atinge project + toate camerele + toate elementele — reîncărcăm snapshot-ul complet
      // (inclusiv summary) ca fiecare pagină/header să reflecte sumele convertite.
      api
        .post<Project>(`/api/projects/${DEFAULT_PROJECT_ID}/currency`, { targetCurrency, exchangeRate })
        .then((updated) => {
          setProject(updated);
          Promise.all([
            api.get<Room[]>(`/api/projects/${DEFAULT_PROJECT_ID}/rooms`),
            api.get<Item[]>(`/api/projects/${DEFAULT_PROJECT_ID}/items`),
          ]).then(([r, i]) => {
            setRooms(r);
            setItems(i);
          });
          reloadSummary();
        });
    },
    [reloadSummary]
  );

  const addRoom = useCallback(
    (room: Omit<Room, "id">) => {
      api.post<Room>(`/api/projects/${DEFAULT_PROJECT_ID}/rooms`, room).then((created) => {
        setRooms((prev) => [...prev, created]);
        reloadSummary();
      });
    },
    [reloadSummary]
  );

  const updateRoom = useCallback(
    (id: string, patch: Partial<Room>) => {
      api.patch<Room>(`/api/rooms/${id}`, patch).then((updated) => {
        setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
        // Câmpurile tehnice pot declanșa reconcilierea elementelor auto-generate pe server — reîncărcăm
        // lista de elemente ca să reflectăm exact ce a calculat backend-ul (adaugă/recalculează/șterge).
        api.get<Item[]>(`/api/projects/${DEFAULT_PROJECT_ID}/items`).then(setItems);
        reloadSummary();
      });
    },
    [reloadSummary]
  );

  const deleteRoom = useCallback(
    (id: string) => {
      api.delete(`/api/rooms/${id}`).then(() => {
        setRooms((prev) => prev.filter((r) => r.id !== id));
        setItems((prev) => prev.filter((i) => i.roomId !== id));
        reloadSummary();
      });
    },
    [reloadSummary]
  );

  const addItem = useCallback(
    (item: Omit<Item, "id">) => {
      api.post<Item>(`/api/rooms/${item.roomId}/items`, item).then((created) => {
        setItems((prev) => [...prev, created]);
        reloadSummary();
      });
    },
    [reloadSummary]
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<Item>) => {
      api.patch<Item>(`/api/items/${id}`, patch).then((updated) => {
        setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
        reloadSummary();
      });
    },
    [reloadSummary]
  );

  const deleteItem = useCallback(
    (id: string) => {
      api.delete(`/api/items/${id}`).then(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        reloadSummary();
      });
    },
    [reloadSummary]
  );

  const value = useMemo<RenovationStore | null>(
    () =>
      project && summary
        ? {
            project,
            rooms,
            items,
            summary,
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
    [project, rooms, items, summary, updateProject, convertCurrency, addRoom, updateRoom, deleteRoom, addItem, updateItem, deleteItem]
  );

  if (!value) return null;

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
