package ro.renovatorpro.domain.service;

import org.junit.jupiter.api.Test;
import ro.renovatorpro.domain.model.FlooringType;
import ro.renovatorpro.domain.model.InstallationType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomDoor;
import ro.renovatorpro.domain.model.RoomType;
import ro.renovatorpro.domain.model.RoomWindow;
import ro.renovatorpro.domain.model.TileSize;
import ro.renovatorpro.domain.model.Wall;
import ro.renovatorpro.domain.model.WallFinish;
import ro.renovatorpro.domain.model.WallFinishType;
import ro.renovatorpro.domain.model.WallTiling;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.barsNeeded;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.baseboardLength;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.baseboardTileArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.floorMaterialNeeded;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.floorWasteRatio;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.paintLiters;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.roomPerimeter;
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

    // --- CALC-1: pierderea de pardoseală depinde de tipul de montaj ---

    @Test
    void floorWasteRatioEste10ProcenteLaMontajDreptSauLipsa() {
        Room fara = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000)).build();
        Room drept = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .installationType(InstallationType.DREPT).build();
        assertThat(floorWasteRatio(fara)).isCloseTo(0.10, within(0.0001));
        assertThat(floorWasteRatio(drept)).isCloseTo(0.10, within(0.0001));
    }

    @Test
    void floorWasteRatioEste15ProcenteLaMontajDiagonal() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .installationType(InstallationType.DIAGONAL).build();
        assertThat(floorWasteRatio(room)).isCloseTo(0.15, within(0.0001));
    }

    @Test
    void floorWasteRatioEste18ProcenteLaHerringbone() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .installationType(InstallationType.HERRINGBONE).build();
        assertThat(floorWasteRatio(room)).isCloseTo(0.18, within(0.0001));
    }

    @Test
    void floorMaterialNeededAplicaPierdereaCorectaLaHerringbone() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .floorArea(30.0)
                .installationType(InstallationType.HERRINGBONE)
                .build();
        assertThat(floorMaterialNeeded(room)).isCloseTo(30.0 * 1.18, within(0.001));
    }

    // --- CALC-2: supliment de pierdere pt. plăci mari/foarte mari ---

    @Test
    void floorWasteRatioAdaugaSupliment2ProcenteLaPlaciMari() {
        Room room = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000))
                .tileSize(TileSize.MARE).build();
        assertThat(floorWasteRatio(room)).isCloseTo(0.12, within(0.0001));
    }

    @Test
    void floorWasteRatioAdaugaSupliment2ProcenteLaPlaciFoarteMariSiSeCumuleazaCuMontajul() {
        Room room = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000))
                .tileSize(TileSize.FOARTE_MARE)
                .installationType(InstallationType.DIAGONAL)
                .build();
        assertThat(floorWasteRatio(room)).isCloseTo(0.17, within(0.0001));
    }

    // --- CALC-3: perimetrul preferă lungimile reale de perete, dacă toate 4 sunt completate ---

    @Test
    void roomPerimeterFolosesteSumaLungimilorDePereteCandToateSuntCompletate() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorArea(12.0)
                .wallTiling(new WallTiling(0, 2.0, Map.of(Wall.NORD, 6.0, Wall.SUD, 6.0, Wall.EST, 2.0, Wall.VEST, 2.0)))
                .build();
        // 6+6+2+2 = 16, NU 4×√12 ≈ 13.86 (presupunerea de cameră pătrată)
        assertThat(roomPerimeter(room)).isCloseTo(16.0, within(0.001));
    }

    @Test
    void roomPerimeterIgnoraLungimilePartialeSiFoloseastePatratul() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorArea(12.0)
                .wallTiling(new WallTiling(0, 2.0, Map.of(Wall.NORD, 6.0)))
                .build();
        assertThat(roomPerimeter(room)).isCloseTo(4 * Math.sqrt(12.0), within(0.001));
    }

    @Test
    void roomPerimeterExplicitAreIntaietateFataDeLungimileDePerete() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .perimeter(20.0)
                .wallTiling(new WallTiling(0, 2.0, Map.of(Wall.NORD, 6.0, Wall.SUD, 6.0, Wall.EST, 2.0, Wall.VEST, 2.0)))
                .build();
        assertThat(roomPerimeter(room)).isCloseTo(20.0, within(0.001));
    }

    // --- CALC-7: pierderea de faianță urcă la 12% quando sunt >1 goluri pe pereții placați ---

    @Test
    void wallTilingAreaFoloseste12ProcenteCandSuntDouaGoluriPePeretiPlacati() {
        Room room = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000))
                .floorMaterial(FlooringType.GRESIE)
                .doors(Map.of(Wall.NORD, new RoomDoor(0.9, 2.0)))
                .windows(Map.of(Wall.EST, new RoomWindow(0.6, 0.6)))
                .wallTiling(new WallTiling(2, 2.0, Map.of(Wall.NORD, 3.0, Wall.EST, 3.0)))
                .build();
        double grossArea = (3.0 + 3.0) * 2.0;
        double openings = 0.9 * 2.0 + 0.6 * 0.6;
        assertThat(wallTilingArea(room)).isCloseTo((grossArea - openings) * 1.12, within(0.001));
    }

    // --- CALC-4: litri de vopsea recomandați (2 straturi, 11 mp/litru) ---

    @Test
    void paintLitersRotunjesteInSusLa0Puncte5() {
        // 22 mp * 2 straturi / 11 mp/l = 4.0 l exact
        assertThat(paintLiters(22.0)).isCloseTo(4.0, within(0.001));
        // 20 mp * 2 / 11 = 3.636... -> rotunjit în sus la 4.0
        assertThat(paintLiters(20.0)).isCloseTo(4.0, within(0.001));
        assertThat(paintLiters(0.0)).isZero();
    }

    // --- CALC-8: numărul de bare de 2 ml pt. plintă/glaf ---

    @Test
    void barsNeededRotunjesteInSus() {
        assertThat(barsNeeded(14.55)).isEqualTo(8);
        assertThat(barsNeeded(4.0)).isEqualTo(2);
        assertThat(barsNeeded(0.0)).isZero();
    }
}
