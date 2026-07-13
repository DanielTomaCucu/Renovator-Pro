"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Item, Project, RenovationStore, Room } from "./types";
import { mockItems, mockProject, mockRooms } from "./mock-data";

const StoreContext = createContext<RenovationStore | null>(null);

let seq = 100;
const nextId = (prefix: string) => `${prefix}${seq++}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project>(mockProject);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [items, setItems] = useState<Item[]>(mockItems);

  const updateProject = useCallback((patch: Partial<Project>) => {
    setProject((prev) => ({ ...prev, ...patch }));
  }, []);

  const addRoom = useCallback((room: Omit<Room, "id">) => {
    setRooms((prev) => [...prev, { ...room, id: nextId("r") }]);
  }, []);

  const updateRoom = useCallback((id: string, patch: Partial<Room>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

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
