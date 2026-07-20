package ro.renovatorpro.domain.model;

import java.util.Map;
import java.util.Objects;

/**
 * O cameră a apartamentului, cu buget alocat propriu. Câmpurile tehnice (pardoseală, ușă, ferestre,
 * placare/finisaj pereți) sunt OPȚIONALE — o cameră nou creată nu are configurare tehnică până când
 * userul o completează explicit în pagina „Configurare Apartament" (câmpurile rămân null până atunci).
 *
 * <p>Regula de business faianță⊕vopsea (mutual exclusive, în funcție de floorMaterial) NU se validează
 * aici — trăiește în domain.service (Faza 2), ca entitatea să rămână un simplu container de date.
 */
public record Room(
        String id,
        RoomType type,
        String name,
        Money allocatedBudget,
        FlooringType floorMaterial,
        Double floorArea,
        Double perimeter,
        TileSize tileSize,
        InstallationType installationType,
        Map<Wall, RoomDoor> doors,
        Double baseboardHeight,
        RoomShape wallShape,
        WallTiling wallTiling,
        WallFinish wallFinish,
        Map<Wall, RoomWindow> windows,
        /** Zugrăvirea tavanului — activată explicit. Aria = floorArea. Disponibilă la ORICE pardoseală. */
        Boolean ceilingPaint,
        /** Încălzire în pardoseală — schimbă tipul foliei de sub parchet. Doar la Parchet Laminat. */
        Boolean underfloorHeating
) {

    public Room {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(type, "type");
        Objects.requireNonNull(name, "name");
        Objects.requireNonNull(allocatedBudget, "allocatedBudget");
        // Hărțile per-perete sunt „parțiale" (max. o ușă/fereastră per perete) — copiate defensiv, null → gol.
        doors = doors == null ? Map.of() : Map.copyOf(doors);
        windows = windows == null ? Map.of() : Map.copyOf(windows);
    }

    public static Builder builder(String id, RoomType type, String name, Money allocatedBudget) {
        return new Builder(id, type, name, allocatedBudget);
    }

    /** Builder pentru câmpurile tehnice opționale — evită un constructor cu 17 argumente la apel. */
    public static final class Builder {
        private final String id;
        private final RoomType type;
        private final String name;
        private final Money allocatedBudget;
        private FlooringType floorMaterial;
        private Double floorArea;
        private Double perimeter;
        private TileSize tileSize;
        private InstallationType installationType;
        private Map<Wall, RoomDoor> doors;
        private Double baseboardHeight;
        private RoomShape wallShape;
        private WallTiling wallTiling;
        private WallFinish wallFinish;
        private Map<Wall, RoomWindow> windows;
        private Boolean ceilingPaint;
        private Boolean underfloorHeating;

        private Builder(String id, RoomType type, String name, Money allocatedBudget) {
            this.id = id;
            this.type = type;
            this.name = name;
            this.allocatedBudget = allocatedBudget;
        }

        public Builder floorMaterial(FlooringType v) { this.floorMaterial = v; return this; }
        public Builder floorArea(Double v) { this.floorArea = v; return this; }
        public Builder perimeter(Double v) { this.perimeter = v; return this; }
        public Builder tileSize(TileSize v) { this.tileSize = v; return this; }
        public Builder installationType(InstallationType v) { this.installationType = v; return this; }
        public Builder doors(Map<Wall, RoomDoor> v) { this.doors = v; return this; }
        public Builder baseboardHeight(Double v) { this.baseboardHeight = v; return this; }
        public Builder wallShape(RoomShape v) { this.wallShape = v; return this; }
        public Builder wallTiling(WallTiling v) { this.wallTiling = v; return this; }
        public Builder wallFinish(WallFinish v) { this.wallFinish = v; return this; }
        public Builder windows(Map<Wall, RoomWindow> v) { this.windows = v; return this; }
        public Builder ceilingPaint(Boolean v) { this.ceilingPaint = v; return this; }
        public Builder underfloorHeating(Boolean v) { this.underfloorHeating = v; return this; }

        public Room build() {
            return new Room(id, type, name, allocatedBudget, floorMaterial, floorArea, perimeter,
                    tileSize, installationType, doors, baseboardHeight, wallShape, wallTiling,
                    wallFinish, windows, ceilingPaint, underfloorHeating);
        }
    }
}
