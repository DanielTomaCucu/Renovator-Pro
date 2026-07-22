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
  /**
   * Elementul `Item` cu `origin: "Din Configurare"` pe care `chooseOffer` îl va ACTUALIZA (în loc să
   * creeze un item nou) — evită dubla sursă de adevăr configurator/comparator, vezi
   * docs/cerinte-comparator-config-sync.md. `undefined` dacă materialul nu vine niciodată din
   * configurator (Mobilă, Electrocasnice, Sanitare etc.) sau camera nu e configurată — pe acea ramură
   * `chooseOffer` creează un item nou, ca înainte.
   */
  linkedItemId?: string;
  createdAt: string;
  offers: Offer[];
}
