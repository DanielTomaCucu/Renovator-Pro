import { ComparisonGroupStatus } from "./ComparisonGroupStatus";
import { MaterialType } from "./MaterialType";
import { Offer } from "./Offer";

/** Un produs de decis pentru o cameră (ex. „Gresie baie"), cu N oferte comparate — nested, un singur GET pentru toată pagina. */
export interface ComparisonGroup {
  id: string;
  roomId: string;
  name: string;
  materialType: MaterialType;
  status: ComparisonGroupStatus;
  chosenOfferId?: string;
  createdItemId?: string;
  createdAt: string;
  offers: Offer[];
}
