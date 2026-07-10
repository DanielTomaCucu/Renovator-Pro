export type RoomType =
  | "Dormitor"
  | "Baie"
  | "Living"
  | "Bucătărie"
  | "Terasă"
  | "Balcon";

export type ItemStatus = "În așteptare" | "Cumpărat" | "Planificat";

export type MaterialType =
  | "Gresie"
  | "Faianță"
  | "Parchet"
  | "Vopsea"
  | "Sanitare"
  | "Mobilă"
  | "Electrocasnice"
  | "Corpuri de iluminat"
  | "Altele";

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  allocatedBudget: number;
}

export interface Item {
  id: string;
  roomId: string;
  name: string;
  materialType: MaterialType;
  source: string;
  status: ItemStatus;
  quantity: number;
  unitPrice: number;
  productUrl?: string;
  imageUrl?: string;
}

export interface Project {
  id: string;
  title: string;
  totalBudget: number;
  currency: "EUR" | "RON";
}
