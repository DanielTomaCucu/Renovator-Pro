import { ItemStatus } from "./ItemStatus";
import { MaterialType } from "./MaterialType";

/** Un element de cumpărat, aparținând unei camere (FK roomId). */
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
