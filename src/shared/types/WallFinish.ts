import { Wall } from "./Wall";
import { WallFinishType } from "./WallFinishType";

/**
 * Configurare de finisaj pereți (vopsea/tapet) pentru camerele cu parchet/mochetă — alternativa la
 * `WallTiling` (faianță), disponibilă doar când pardoseala nu e Gresie. Fiecare perete e independent:
 * poate fi Vopsea, Tapet, sau neconfigurat (nelipsit din `finishes`).
 */
export interface WallFinish {
  wallHeight: number;
  wallLengths: Record<Wall, number>;
  finishes: Partial<Record<Wall, WallFinishType>>;
}
