package ro.renovatorpro.domain.service;

import org.junit.jupiter.api.Test;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class BudgetCalculatorTest {

    private static Item item(String roomId, ItemStatus status, int quantity, long unitPrice, MaterialType type) {
        return new Item("i-" + roomId + "-" + status + "-" + type, roomId, "Test", type, "", status,
                BigDecimal.valueOf(quantity), Money.of(unitPrice), null, null, ItemOrigin.MANUAL,
                Instant.now(), null);
    }

    @Test
    void itemTotalEsteCantitateInmultitaCuPretUnitar() {
        Item i = item("r1", ItemStatus.PLANIFICAT, 3, 10, MaterialType.ALTELE);
        assertThat(BudgetCalculator.itemTotal(i).amount()).isEqualByComparingTo("30.00");
    }

    @Test
    void totalSpentNumaraDoarStatusulCumparat() {
        List<Item> items = List.of(
                item("r1", ItemStatus.CUMPARAT, 1, 100, MaterialType.GRESIE),
                item("r1", ItemStatus.PLANIFICAT, 1, 50, MaterialType.GRESIE),
                item("r1", ItemStatus.IN_ASTEPTARE, 1, 25, MaterialType.GRESIE)
        );
        assertThat(BudgetCalculator.totalSpent(items).amount()).isEqualByComparingTo("100.00");
        assertThat(BudgetCalculator.totalEstimated(items).amount()).isEqualByComparingTo("175.00");
    }

    @Test
    void purchaseProgressRotunjesteLaProcentIntreg() {
        List<Item> items = List.of(
                item("r1", ItemStatus.CUMPARAT, 1, 1, MaterialType.ALTELE),
                item("r1", ItemStatus.PLANIFICAT, 1, 1, MaterialType.ALTELE),
                item("r1", ItemStatus.PLANIFICAT, 1, 1, MaterialType.ALTELE)
        );
        assertThat(BudgetCalculator.purchaseProgress(items)).isEqualTo(33);
        assertThat(BudgetCalculator.purchaseProgress(List.of())).isZero();
    }

    @Test
    void budgetRemainingPoateFiNegativLaDepasire() {
        List<Item> items = List.of(item("r1", ItemStatus.CUMPARAT, 1, 150, MaterialType.ALTELE));
        BigDecimal remaining = BudgetCalculator.budgetRemaining(Money.of(100), items);
        assertThat(remaining).isEqualByComparingTo("-50.00");
    }

    @Test
    void budgetEfficiencyReturneazaZeroCandEstimatulEZero() {
        assertThat(BudgetCalculator.budgetEfficiency(Money.zero(), Money.zero())).isZero();
        assertThat(BudgetCalculator.budgetEfficiency(Money.of(200), Money.of(50))).isEqualTo(25);
    }

    @Test
    void roomSubtotalSiRoomSpentFiltreazaPeCamera() {
        List<Item> items = List.of(
                item("r1", ItemStatus.CUMPARAT, 1, 100, MaterialType.GRESIE),
                item("r2", ItemStatus.CUMPARAT, 1, 999, MaterialType.GRESIE)
        );
        assertThat(BudgetCalculator.roomSubtotal(items, "r1").amount()).isEqualByComparingTo("100.00");
        assertThat(BudgetCalculator.roomSpent(items, "r1").amount()).isEqualByComparingTo("100.00");
    }

    @Test
    void costPerRoomExcludeCamereleGoaleSiSorteazaDescrescator() {
        Room r1 = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000)).build();
        Room r2 = Room.builder("r2", RoomType.DORMITOR, "Dormitor", Money.of(1000)).build();
        Room r3 = Room.builder("r3", RoomType.LIVING, "Living gol", Money.of(1000)).build();
        List<Item> items = List.of(
                item("r1", ItemStatus.CUMPARAT, 1, 50, MaterialType.ALTELE),
                item("r2", ItemStatus.CUMPARAT, 1, 200, MaterialType.ALTELE)
        );
        List<BudgetCalculator.RoomCost> result = BudgetCalculator.costPerRoom(List.of(r1, r2, r3), items);
        assertThat(result).extracting(BudgetCalculator.RoomCost::name).containsExactly("Dormitor", "Baie");
    }

    @Test
    void costPerRoomIgnoraElementeleNeachizitionate() {
        Room r1 = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000)).build();
        List<Item> items = List.of(
                item("r1", ItemStatus.PLANIFICAT, 1, 500, MaterialType.ALTELE),
                item("r1", ItemStatus.IN_ASTEPTARE, 1, 500, MaterialType.ALTELE)
        );
        List<BudgetCalculator.RoomCost> result = BudgetCalculator.costPerRoom(List.of(r1), items);
        assertThat(result).isEmpty(); // nimic cumpărat încă în cameră → camera nu apare în donut
    }

    @Test
    void costPerRoomCuProiectFaraCamereIntoarceListaGoala() {
        assertThat(BudgetCalculator.costPerRoom(List.of(), List.of())).isEmpty();
    }

    @Test
    void roomSubtotalSiRoomSpentPentruOCameraFaraElementeSuntZero() {
        assertThat(BudgetCalculator.roomSubtotal(List.of(), "r-inexistent").amount()).isEqualByComparingTo("0.00");
        assertThat(BudgetCalculator.roomSpent(List.of(), "r-inexistent").amount()).isEqualByComparingTo("0.00");
    }

    @Test
    void totalSpentEsteZeroCandNimicNuECumparat() {
        List<Item> items = List.of(
                item("r1", ItemStatus.PLANIFICAT, 1, 100, MaterialType.GRESIE),
                item("r1", ItemStatus.IN_ASTEPTARE, 1, 50, MaterialType.GRESIE)
        );
        assertThat(BudgetCalculator.totalSpent(items).amount()).isEqualByComparingTo("0.00");
        assertThat(BudgetCalculator.boughtCount(items)).isZero();
        assertThat(BudgetCalculator.purchaseProgress(items)).isZero();
    }

    @Test
    void budgetRemainingCuBugetZeroEgaleazaMinusCheltuit() {
        List<Item> items = List.of(item("r1", ItemStatus.CUMPARAT, 1, 50, MaterialType.ALTELE));
        assertThat(BudgetCalculator.budgetRemaining(Money.zero(), items)).isEqualByComparingTo("-50.00");
    }

    @Test
    void budgetRemainingCuBugetZeroSiNimicCheltuitEsteZero() {
        assertThat(BudgetCalculator.budgetRemaining(Money.zero(), List.of())).isEqualByComparingTo("0.00");
    }

    @Test
    void budgetEfficiencyCuEstimatPozitivDarNimicCheltuitEsteZero() {
        assertThat(BudgetCalculator.budgetEfficiency(Money.of(500), Money.zero())).isZero();
    }

    @Test
    void costPerCategoryCuListaGoalaIntoarceMapGoala() {
        assertThat(BudgetCalculator.costPerCategory(List.of())).isEmpty();
    }

    @Test
    void costPerCategoryAgregaTotalSiSpentPerCategorie() {
        List<Item> items = List.of(
                item("r1", ItemStatus.CUMPARAT, 1, 100, MaterialType.GRESIE),
                item("r1", ItemStatus.PLANIFICAT, 1, 50, MaterialType.GRESIE),
                item("r1", ItemStatus.CUMPARAT, 1, 30, MaterialType.VOPSEA)
        );
        Map<MaterialType, BudgetCalculator.CategoryCost> result = BudgetCalculator.costPerCategory(items);
        assertThat(result.get(MaterialType.GRESIE).total().amount()).isEqualByComparingTo("150.00");
        assertThat(result.get(MaterialType.GRESIE).spent().amount()).isEqualByComparingTo("100.00");
        assertThat(result.get(MaterialType.VOPSEA).spent().amount()).isEqualByComparingTo("30.00");
    }

    @Test
    void proiectFaraCamereProduceAgregariGoaleFaraSaEsueze() {
        assertThat(BudgetCalculator.costPerRoom(List.of(), List.of())).isEmpty();
        assertThat(BudgetCalculator.costPerCategory(List.of())).isEmpty();
        assertThat(BudgetCalculator.totalEstimated(List.of()).amount()).isEqualByComparingTo("0.00");
        assertThat(BudgetCalculator.totalSpent(List.of()).amount()).isEqualByComparingTo("0.00");
        assertThat(BudgetCalculator.boughtCount(List.of())).isZero();
    }

    @Test
    void bugetRemainingCuBugetZeroSiNimicCheltuitEsteZero() {
        BigDecimal remaining = BudgetCalculator.budgetRemaining(Money.zero(), List.of());
        assertThat(remaining).isEqualByComparingTo("0.00");
    }

    @Test
    void bugetRemainingCuBugetZeroSiCevaCheltuitEsteNegativ() {
        List<Item> items = List.of(item("r1", ItemStatus.CUMPARAT, 1, 50, MaterialType.ALTELE));
        BigDecimal remaining = BudgetCalculator.budgetRemaining(Money.zero(), items);
        assertThat(remaining).isEqualByComparingTo("-50.00");
    }

    @Test
    void costPerRoomCuCamereDarFaraElementeEsteGol() {
        Room r1 = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1000)).build();
        assertThat(BudgetCalculator.costPerRoom(List.of(r1), List.of())).isEmpty();
    }
}
