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
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.adhesiveBags;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.barsNeeded;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.baseboardLength;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.baseboardTileArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.ceilingPaintArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.floorAdhesiveKg;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.floorMaterialNeeded;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.floorWasteRatio;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.groutKg;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.paintAboveTilingArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.paintLiters;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.paintPrimerLiters;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.roomPerimeter;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.tilingPrimerLiters;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.underlayArea;
import static ro.renovatorpro.domain.service.RoomDimensionsCalculator.wallAdhesiveKg;
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

    // --- ZUG: zugrăveli complete + consumabile de montaj (docs/cerinte-zugraveli.md) ---

    /** Baie gresie 6mp, plăci Mari (60x60), faianță 2 pereți (N+E, 3ml fiecare, tileHeight 1.5m), roomHeight 2.5m, tavan zugrăvit. */
    private Room baieGresieMareCuTavanSiDeasupraFaiantei() {
        return Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1500))
                .floorMaterial(FlooringType.GRESIE)
                .floorArea(6.0)
                .tileSize(TileSize.MARE)
                .ceilingPaint(true)
                .wallTiling(new WallTiling(2, 1.5, Map.of(Wall.NORD, 3.0, Wall.EST, 3.0), 2.5, TileSize.MARE))
                .build();
    }

    @Test
    void ceilingPaintAreaAplicaPierdereDe10ProcenteCandEsteActivat() {
        Room room = baieGresieMareCuTavanSiDeasupraFaiantei();
        assertThat(ceilingPaintArea(room)).isCloseTo(6.0 * 1.10, within(0.001));
    }

    @Test
    void ceilingPaintAreaEsteZeroCandNuEActivat() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .floorArea(10.0)
                .build();
        assertThat(ceilingPaintArea(room)).isZero();
    }

    @Test
    void paintAboveTilingAreaCalculeazaPeretiiPlacatiFaraScadereGoluriSiNeplacatiCuScadere() {
        Room room = baieGresieMareCuTavanSiDeasupraFaiantei();
        // pereți placați N+E: (3+3) * (2.5-1.5) = 6.0; pereți neplacați (S,V) fără lungime completată -> 0
        double expected = 6.0 * (1 + 0.10);
        assertThat(paintAboveTilingArea(room)).isCloseTo(expected, within(0.001));
    }

    @Test
    void paintAboveTilingAreaEsteZeroCandRoomHeightLipsesteSauNuDepasesteTileHeight() {
        Room faraRoomHeight = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000))
                .floorMaterial(FlooringType.GRESIE)
                .wallTiling(new WallTiling(2, 1.5, Map.of(Wall.NORD, 3.0, Wall.EST, 3.0)))
                .build();
        assertThat(paintAboveTilingArea(faraRoomHeight)).isZero();

        Room roomHeightEgalTileHeight = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000))
                .floorMaterial(FlooringType.GRESIE)
                .wallTiling(new WallTiling(2, 1.5, Map.of(Wall.NORD, 3.0), 1.5, null))
                .build();
        assertThat(paintAboveTilingArea(roomHeightEgalTileHeight)).isZero();
    }

    @Test
    void paintLitersAgregatIncludeTavanSiDeasupraFaiantei() {
        Room room = baieGresieMareCuTavanSiDeasupraFaiantei();
        double paintArea = wallFinishArea(room, WallFinishType.VOPSEA); // 0 la Gresie
        double total = paintArea + ceilingPaintArea(room) + paintAboveTilingArea(room);
        // 6.6 (tavan) + 6.6 (deasupra faianței) = 13.2mp -> 13.2*2/11 = 2.4l -> rotunjit sus la 0.5 -> 2.5l
        assertThat(paintLiters(total)).isCloseTo(2.5, within(0.001));
    }

    @Test
    void paintPrimerLitersAcopereZugravealaSiRotunjesteLaLitruIntreg() {
        Room room = baieGresieMareCuTavanSiDeasupraFaiantei();
        // (6.6 + 6.6) * 0.10 = 1.32 -> rotunjit sus la 2
        assertThat(paintPrimerLiters(room)).isCloseTo(2.0, within(0.001));
    }

    @Test
    void tilingPrimerLitersFoloseteAriiNeteSiRotunjesteLaLitruIntreg() {
        Room room = baieGresieMareCuTavanSiDeasupraFaiantei();
        // netFloor 6.0 + netFaianta (3+3)*1.5=9.0 = 15.0 -> *0.15=2.25 -> rotunjit sus la 3
        assertThat(tilingPrimerLiters(room)).isCloseTo(3.0, within(0.001));
    }

    @Test
    void floorAdhesiveKgFoloseteMareCuDublaIncleiere() {
        Room room = baieGresieMareCuTavanSiDeasupraFaiantei();
        // 6.0 * 5.5 * 1.10 = 36.3
        assertThat(floorAdhesiveKg(room)).isCloseTo(36.3, within(0.001));
    }

    @Test
    void wallAdhesiveKgFoloseteMareCuDublaIncleiere() {
        Room room = baieGresieMareCuTavanSiDeasupraFaiantei();
        // netFaianta 9.0 * 5.5 * 1.10 = 54.45
        assertThat(wallAdhesiveKg(room)).isCloseTo(54.45, within(0.001));
    }

    @Test
    void adhesiveBagsRotunjesteInSusSacul25Kg() {
        Room room = baieGresieMareCuTavanSiDeasupraFaiantei();
        // (36.3 + 54.45) / 25 = 3.63 -> 4 saci
        assertThat(adhesiveBags(room)).isEqualTo(4);
    }

    @Test
    void groutKgFoloseteTabelulPeTileSizeSiRotunjesteLaKgIntreg() {
        Room room = baieGresieMareCuTavanSiDeasupraFaiantei();
        // (6.0*0.10 + 9.0*0.10) * 1.10 = 1.65 -> rotunjit sus la 2
        assertThat(groutKg(room)).isCloseTo(2.0, within(0.001));
    }

    @Test
    void tileSizeAbsentFoloseesteMedieLaAdezivSiChit() {
        Room room = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000))
                .floorMaterial(FlooringType.GRESIE)
                .floorArea(4.0)
                .build();
        // Medie: 3.5 kg/mp adeziv, 0.24 kg/mp chit
        assertThat(floorAdhesiveKg(room)).isCloseTo(4.0 * 3.5 * 1.10, within(0.001));
        assertThat(groutKg(room)).isCloseTo(Math.ceil(4.0 * 0.24 * 1.10), within(0.001));
    }

    @Test
    void underlayAreaNuDepindeDeUnderfloorHeatingDoarNumeleElementuluiSeSchimba() {
        Room faraIncalzire = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .floorArea(10.0)
                .underfloorHeating(false)
                .build();
        Room cuIncalzire = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .floorArea(10.0)
                .underfloorHeating(true)
                .build();
        assertThat(underlayArea(faraIncalzire)).isCloseTo(11.0, within(0.001));
        assertThat(underlayArea(cuIncalzire)).isCloseTo(11.0, within(0.001));
    }

    @Test
    void underlayAreaEsteZeroCandNuEParchetLaminat() {
        Room room = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000))
                .floorMaterial(FlooringType.GRESIE)
                .floorArea(10.0)
                .build();
        assertThat(underlayArea(room)).isZero();
    }

    @Test
    void cameraFaraNimicConfiguratToateConsumabileleNoiSuntZero() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000)).build();
        assertThat(ceilingPaintArea(room)).isZero();
        assertThat(paintAboveTilingArea(room)).isZero();
        assertThat(paintPrimerLiters(room)).isZero();
        assertThat(tilingPrimerLiters(room)).isZero();
        assertThat(floorAdhesiveKg(room)).isZero();
        assertThat(wallAdhesiveKg(room)).isZero();
        assertThat(adhesiveBags(room)).isZero();
        assertThat(groutKg(room)).isZero();
        assertThat(underlayArea(room)).isZero();
    }

    @Test
    void projectTechnicalSummaryConsideraCameraConfigurataDoarDupaPardoseala() {
        // Regresie: condiția veche cerea și `perimeter() != null` — câmp eliminat din UI, deci progresul
        // rămânea 0% permanent pentru orice cameră configurată prin fluxul actual (fără uși/perimetru explicit).
        Room configurataFaraUsi = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .floorArea(20.0)
                .build();
        Room neconfigurata = Room.builder("r2", RoomType.BAIE, "Baie", Money.of(1000)).build();

        RoomDimensionsCalculator.ProjectTechnicalSummary summary =
                RoomDimensionsCalculator.projectTechnicalSummary(java.util.List.of(configurataFaraUsi, neconfigurata));

        assertThat(summary.totalFloorArea()).isCloseTo(20.0, within(0.001));
        assertThat(summary.configuredRoomsRatio()).isCloseTo(0.5, within(0.001));
    }
}
