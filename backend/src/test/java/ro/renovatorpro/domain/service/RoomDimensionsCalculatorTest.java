package ro.renovatorpro.domain.service;

import org.junit.jupiter.api.Test;
import ro.renovatorpro.domain.model.FlooringType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomDoor;
import ro.renovatorpro.domain.model.RoomType;
import ro.renovatorpro.domain.model.RoomWindow;
import ro.renovatorpro.domain.model.Wall;
import ro.renovatorpro.domain.model.WallFinish;
import ro.renovatorpro.domain.model.WallFinishType;
import ro.renovatorpro.domain.model.WallTiling;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.baseboardLength;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.baseboardTileArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.floorMaterialNeeded;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.wallFinishArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.wallTilingArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.windowTrimLength;

class RoomDimensionsCalculatorTest {

    @Test
    void floorMaterialNeededAplicaPierdereDe10Procent() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .floorArea(10.0)
                .build();
        assertThat(floorMaterialNeeded(room)).isCloseTo(11.0, within(0.001));
    }

    @Test
    void laGresiePlintaSeAdaugaLaNecesarulDePardoseala() {
        Room room = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000))
                .floorMaterial(FlooringType.GRESIE)
                .floorArea(6.0)
                .perimeter(10.0)
                .baseboardHeight(0.08)
                .build();
        // plintă: 10 * 1.05 = 10.5m; suprafață plintă: 10.5 * 0.08 = 0.84mp
        double expectedBaseboardArea = 10.0 * 1.05 * 0.08;
        assertThat(baseboardTileArea(room)).isCloseTo(expectedBaseboardArea, within(0.001));
        // pardoseală: 6 * 1.1 = 6.6mp + plintă 0.84mp
        assertThat(floorMaterialNeeded(room)).isCloseTo(6.6 + expectedBaseboardArea, within(0.001));
    }

    @Test
    void laParchetPlintaNuIntraInSuprafataDePardoseala() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .floorArea(6.0)
                .perimeter(10.0)
                .baseboardHeight(0.08)
                .build();
        assertThat(baseboardTileArea(room)).isZero();
    }

    @Test
    void baseboardLengthScadeLatimeaUsilor() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .perimeter(10.0)
                .doors(Map.of(Wall.NORD, new RoomDoor(0.9, 2.0)))
                .build();
        // (10 - 0.9) * 1.05
        assertThat(baseboardLength(room)).isCloseTo((10.0 - 0.9) * 1.05, within(0.001));
    }

    @Test
    void wallTilingAreaScadeGolurileSiAplicaPierdereDoarLaGresie() {
        Room room = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000))
                .floorMaterial(FlooringType.GRESIE)
                .doors(Map.of(Wall.NORD, new RoomDoor(0.9, 2.0)))
                .wallTiling(new WallTiling(2, 2.0, Map.of(Wall.NORD, 3.0, Wall.EST, 3.0)))
                .build();
        double grossArea = (3.0 + 3.0) * 2.0;
        double doorArea = 0.9 * 2.0;
        double expected = (grossArea - doorArea) * 1.1;
        assertThat(wallTilingArea(room)).isCloseTo(expected, within(0.001));
    }

    @Test
    void wallTilingAreaEsteZeroCandNuEGresie() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .wallTiling(new WallTiling(2, 2.0, Map.of(Wall.NORD, 3.0)))
                .build();
        assertThat(wallTilingArea(room)).isZero();
    }

    @Test
    void wallFinishAreaFolosestePierdereDiferitaPentruVopseaVersusTapet() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .wallFinish(new WallFinish(2.5, Map.of(Wall.NORD, 4.0, Wall.EST, 4.0),
                        Map.of(Wall.NORD, WallFinishType.VOPSEA, Wall.EST, WallFinishType.TAPET)))
                .build();
        double areaPerWall = 4.0 * 2.5;
        assertThat(wallFinishArea(room, WallFinishType.VOPSEA)).isCloseTo(areaPerWall * 1.1, within(0.001));
        assertThat(wallFinishArea(room, WallFinishType.TAPET)).isCloseTo(areaPerWall * 1.15, within(0.001));
    }

    @Test
    void windowTrimLengthSumeazaPerimetrulTuturorFerestrelor() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .windows(Map.of(Wall.NORD, new RoomWindow(1.2, 1.4)))
                .build();
        double perimeter = 2 * (1.2 + 1.4);
        assertThat(windowTrimLength(room)).isCloseTo(perimeter * 1.05, within(0.001));
    }
}
