import { RoomType } from "./RoomType";

/** O cameră a apartamentului, cu buget alocat propriu. */
export interface Room {
  id: string;
  type: RoomType;
  name: string;
  allocatedBudget: number;
}
