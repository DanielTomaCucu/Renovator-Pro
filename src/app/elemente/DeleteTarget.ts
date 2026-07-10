/** Ținta unei acțiuni de ștergere în curs de confirmare pe pagina Elemente de Cumpărat. */
export interface DeleteTarget {
  kind: "item" | "room";
  id: string;
  name: string;
}
