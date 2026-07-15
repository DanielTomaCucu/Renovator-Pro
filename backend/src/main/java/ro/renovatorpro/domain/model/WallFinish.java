package ro.renovatorpro.domain.model;

import java.util.Map;

/**
 * Configurare de finisaj pereți (vopsea/tapet) pentru camere cu parchet/mochetă — alternativă la
 * `WallTiling` (faianță), disponibilă doar când pardoseala nu e Gresie. Fiecare perete e independent:
 * poate fi Vopsea, Tapet, sau neconfigurat (absent din `finishes`).
 */
public record WallFinish(double wallHeight, Map<Wall, Double> wallLengths, Map<Wall, WallFinishType> finishes) {

    public WallFinish {
        wallLengths = wallLengths == null ? Map.of() : Map.copyOf(wallLengths);
        finishes = finishes == null ? Map.of() : Map.copyOf(finishes);
    }
}
