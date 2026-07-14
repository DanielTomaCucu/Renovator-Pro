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
import { Currency, Item, Project, RenovationStore, Room } from "./types";
import { mockItems, mockProject, mockRooms } from "./mock-data";
import { syncAutoItemsForRoom } from "./functions/auto-items";

const StoreContext = createContext<RenovationStore | null>(null);

/** Cheie localStorage — reține ultima monedă aleasă de user (pagina Setări), independent de proiectul mock. */
const CURRENCY_STORAGE_KEY = "renovator-pro:currency";

let seq = 100;
const nextId = (prefix: string) => `${prefix}${seq++}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project>(mockProject);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [items, setItems] = useState<Item[]>(mockItems);

  // Citește moneda salvată doar după montare (client), ca să nu difere de randarea server-side (SSR mereu pornește cu mockProject.currency).
  // Nu e anti-pattern-ul „sincronizare cu props/randare" interzis de React 19 — e sincronizare cu un sistem extern
  // (localStorage), cazul explicit permis de documentația React pt. useEffect + setState.
  useEffect(() => {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved === Currency.EUR || saved === Currency.RON) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProject((prev) => ({ ...prev, currency: saved }));
    }
  }, []);

  const updateProject = useCallback((patch: Partial<Project>) => {
    setProject((prev) => ({ ...prev, ...patch }));
    if (patch.currency) {
      localStorage.setItem(CURRENCY_STORAGE_KEY, patch.currency);
    }
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
      // Sincronizează elementele auto-generate din configurarea tehnică (pardoseală/plintă/faianță) cu noile măsurători.
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
    () => ({
      project,
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
    [
      project,
      rooms,
      items,
      updateProject,
      addRoom,
      updateRoom,
      deleteRoom,
      addItem,
      updateItem,
      deleteItem,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
