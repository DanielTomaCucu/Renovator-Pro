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
import { Item, Project, RenovationStore, Room } from "./types";
import { mockItems, mockProject, mockRooms } from "./mock-data";
import { api, DEFAULT_PROJECT_ID } from "./api-client";
import { syncAutoItemsForRoom } from "./functions/auto-items";

const StoreContext = createContext<RenovationStore | null>(null);

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

let seq = 100;
const nextId = (prefix: string) => `${prefix}${seq++}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  return USE_MOCK_DATA ? <MockStoreProvider>{children}</MockStoreProvider> : <ApiStoreProvider>{children}</ApiStoreProvider>;
}

/** Store conectat la backend-ul real (Faza 6) — mutațiile apelează API-ul, apoi actualizează starea locală din răspuns. */
function ApiStoreProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Project>(`/api/projects/${DEFAULT_PROJECT_ID}`),
      api.get<Room[]>(`/api/projects/${DEFAULT_PROJECT_ID}/rooms`),
      api.get<Item[]>(`/api/projects/${DEFAULT_PROJECT_ID}/items`),
    ]).then(([p, r, i]) => {
      setProject(p);
      setRooms(r);
      setItems(i);
      setLoaded(true);
    });
  }, []);

  const updateProject = useCallback((patch: Partial<Project>) => {
    api.patch<Project>(`/api/projects/${DEFAULT_PROJECT_ID}`, patch).then((updated) => setProject(updated));
  }, []);

  const addRoom = useCallback((room: Omit<Room, "id">) => {
    api.post<Room>(`/api/projects/${DEFAULT_PROJECT_ID}/rooms`, room).then((created) =>
      setRooms((prev) => [...prev, created])
    );
  }, []);

  const updateRoom = useCallback((id: string, patch: Partial<Room>) => {
    api.patch<Room>(`/api/rooms/${id}`, patch).then((updated) => {
      setRooms((prev) => prev.map((r) => (r.id === id ? updated : r)));
      // Câmpurile tehnice pot declanșa reconcilierea elementelor auto-generate pe server — reîncărcăm
      // lista de elemente ca să reflectăm exact ce a calculat backend-ul (adaugă/recalculează/șterge).
      api.get<Item[]>(`/api/projects/${DEFAULT_PROJECT_ID}/items`).then(setItems);
    });
  }, []);

  const deleteRoom = useCallback((id: string) => {
    api.delete(`/api/rooms/${id}`).then(() => {
      setRooms((prev) => prev.filter((r) => r.id !== id));
      setItems((prev) => prev.filter((i) => i.roomId !== id));
    });
  }, []);

  const addItem = useCallback((item: Omit<Item, "id">) => {
    api.post<Item>(`/api/rooms/${item.roomId}/items`, item).then((created) =>
      setItems((prev) => [...prev, created])
    );
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<Item>) => {
    api.patch<Item>(`/api/items/${id}`, patch).then((updated) =>
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)))
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    api.delete(`/api/items/${id}`).then(() => setItems((prev) => prev.filter((i) => i.id !== id)));
  }, []);

  const value = useMemo(
    () => ({
      project: project ?? mockProject,
      rooms,
      items,
      updateProject,
      addRoom,
      updateRoom,
      deleteRoom,
      addItem,
      updateItem,
      deleteItem,
    }),
    [project, rooms, items, updateProject, addRoom, updateRoom, deleteRoom, addItem, updateItem, deleteItem]
  );

  if (!loaded) return null;

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** Store mock in-memory (fallback demo, `NEXT_PUBLIC_USE_MOCK_DATA=true`) — comportamentul dinaintea Fazei 6. */
function MockStoreProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project>(mockProject);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [items, setItems] = useState<Item[]>(mockItems);

  const updateProject = useCallback((patch: Partial<Project>) => {
    setProject((prev) => ({ ...prev, ...patch }));
  }, []);

  const addRoom = useCallback((room: Omit<Room, "id">) => {
    setRooms((prev) => [...prev, { ...room, id: nextId("r") }]);
  }, []);

  const updateRoom = useCallback(
    (id: string, patch: Partial<Room>) => {
      const current = rooms.find((r) => r.id === id);
      if (!current) return;
      const updatedRoom = { ...current, ...patch };
      setRooms((prev) => prev.map((r) => (r.id === id ? updatedRoom : r)));
      setItems((prev) => syncAutoItemsForRoom(prev, updatedRoom, () => nextId("i")));
    },
    [rooms]
  );

  const deleteRoom = useCallback((id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    setItems((prev) => prev.filter((i) => i.roomId !== id));
  }, []);

  const addItem = useCallback((item: Omit<Item, "id">) => {
    setItems((prev) => [...prev, { ...item, id: nextId("i") }]);
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const value = useMemo(
    () => ({ project, rooms, items, updateProject, addRoom, updateRoom, deleteRoom, addItem, updateItem, deleteItem }),
    [project, rooms, items, updateProject, addRoom, updateRoom, deleteRoom, addItem, updateItem, deleteItem]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
