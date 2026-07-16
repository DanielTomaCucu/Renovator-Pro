package ro.renovatorpro.domain.service;

import org.junit.jupiter.api.Test;
import ro.renovatorpro.domain.model.FlooringType;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomType;
import ro.renovatorpro.domain.model.Wall;
import ro.renovatorpro.domain.model.WallFinish;
import ro.renovatorpro.domain.model.WallFinishType;
import ro.renovatorpro.domain.model.WallTiling;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

class AutoItemReconcilerTest {

    private Room baiaGresie() {
        return Room.builder("r1", RoomType.BAIE, "Baie Principală", Money.of(1200))
                .floorMaterial(FlooringType.GRESIE)
                .floorArea(6.0)
                .perimeter(10.0)
                .baseboardHeight(0.08)
                .wallTiling(new WallTiling(2, 2.0, Map.of(Wall.NORD, 3.0, Wall.EST, 3.0)))
                .build();
    }

    @Test
    void generateAutoItemsProduceGresieCuPlintaInclusaLaCameraDeBaie() {
        List<AutoItemReconciler.ItemDraft> drafts = AutoItemReconciler.generateAutoItems(baiaGresie());
        assertThat(drafts).anySatisfy(d -> {
            assertThat(d.materialType()).isEqualTo(MaterialType.GRESIE);
            assertThat(d.name()).contains("Plintă");
        });
        assertThat(drafts).anySatisfy(d -> assertThat(d.materialType()).isEqualTo(MaterialType.FAIANTA));
        // Nicio Plintă separată la Gresie — e inclusă în pardoseală.
        assertThat(drafts).noneMatch(d -> d.materialType() == MaterialType.PLINTA);
    }

    @Test
    void generateAutoItemsProducePlintaSeparataLaParchet() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .floorArea(10.0)
                .perimeter(12.0)
                .build();
        List<AutoItemReconciler.ItemDraft> drafts = AutoItemReconciler.generateAutoItems(room);
        assertThat(drafts).anyMatch(d -> d.materialType() == MaterialType.PLINTA);
        assertThat(drafts).noneMatch(d -> d.materialType() == MaterialType.FAIANTA);
    }

    @Test
    void generateAutoItemsProduceVopseaSiTapetSeparatLaParchet() {
        Room room = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .wallFinish(new WallFinish(2.5, Map.of(Wall.NORD, 4.0, Wall.EST, 4.0),
                        Map.of(Wall.NORD, WallFinishType.VOPSEA, Wall.EST, WallFinishType.TAPET)))
                .build();
        List<AutoItemReconciler.ItemDraft> drafts = AutoItemReconciler.generateAutoItems(room);
        assertThat(drafts).anyMatch(d -> d.materialType() == MaterialType.VOPSEA);
        assertThat(drafts).anyMatch(d -> d.materialType() == MaterialType.TAPET);
    }

    @Test
    void reconcilePastreazaIdPretStatusAleElementelorExistente() {
        Room room = baiaGresie();
        Instant vechiCreatedAt = Instant.parse("2026-01-01T00:00:00Z");
        Instant vechiPurchasedAt = Instant.parse("2026-01-05T00:00:00Z");
        Item existingGresie = new Item("existing-1", "r1", "Gresie veche (Pardoseală + Plintă)",
                MaterialType.GRESIE, "Dedeman", ItemStatus.CUMPARAT, BigDecimal.TEN, Money.of(500),
                null, null, ItemOrigin.CONFIGURARE, vechiCreatedAt, vechiPurchasedAt);
        List<Item> reconciled = AutoItemReconciler.reconcile(List.of(existingGresie), room, () -> "new-id",
                Instant.parse("2026-06-01T00:00:00Z"));

        Item gresieDupa = reconciled.stream().filter(i -> i.materialType() == MaterialType.GRESIE).findFirst().orElseThrow();
        assertThat(gresieDupa.id()).isEqualTo("existing-1");
        assertThat(gresieDupa.unitPrice().amount()).isEqualByComparingTo("500.00");
        assertThat(gresieDupa.status()).isEqualTo(ItemStatus.CUMPARAT);
        assertThat(gresieDupa.source()).isEqualTo("Dedeman");
        // createdAt/purchasedAt se păstrează neschimbate — la fel ca id/preț/status/sursă.
        assertThat(gresieDupa.createdAt()).isEqualTo(vechiCreatedAt);
        assertThat(gresieDupa.purchasedAt()).isEqualTo(vechiPurchasedAt);
        // Cantitatea și numele SE recalculează.
        assertThat(gresieDupa.name()).contains("Plintă");
    }

    @Test
    void reconcileNuAtingeElementeleManuale() {
        Room room = baiaGresie();
        Item manual = new Item("manual-1", "r1", "Robinet", MaterialType.SANITARE, "Hornbach",
                ItemStatus.PLANIFICAT, BigDecimal.ONE, Money.of(200), null, null, ItemOrigin.MANUAL,
                Instant.now(), null);
        List<Item> reconciled = AutoItemReconciler.reconcile(List.of(manual), room, () -> "new-id", Instant.now());
        assertThat(reconciled).contains(manual);
    }

    @Test
    void reconcileStergeElementeleOrfaneCandMasuratoareaDispare() {
        Room roomFaraFaianta = Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1200))
                .floorMaterial(FlooringType.GRESIE)
                .floorArea(6.0)
                .perimeter(10.0)
                .build(); // fără wallTiling
        Item faiantaVeche = new Item("faianta-1", "r1", "Faianță (2 pereți)", MaterialType.FAIANTA,
                "", ItemStatus.IN_ASTEPTARE, BigDecimal.TEN, Money.zero(), null, null, ItemOrigin.CONFIGURARE,
                Instant.now(), null);
        List<Item> reconciled = AutoItemReconciler.reconcile(List.of(faiantaVeche), roomFaraFaianta, () -> "new-id", Instant.now());
        assertThat(reconciled).noneMatch(i -> i.materialType() == MaterialType.FAIANTA);
    }

    @Test
    void reconcileAtribuieIdNouElementelorNouAparute() {
        AtomicInteger counter = new AtomicInteger();
        List<Item> reconciled = AutoItemReconciler.reconcile(List.of(), baiaGresie(),
                () -> "generated-" + counter.incrementAndGet(), Instant.now());
        assertThat(reconciled).isNotEmpty();
        assertThat(reconciled).allMatch(i -> i.origin() == ItemOrigin.CONFIGURARE);
        assertThat(reconciled).allMatch(i -> i.id().startsWith("generated-"));
    }

    @Test
    void reconcileNuAtingeElementeleAltorCamere() {
        Item altaCamera = new Item("other-1", "r2", "Ceva", MaterialType.ALTELE, "", ItemStatus.PLANIFICAT,
                BigDecimal.ONE, Money.zero(), null, null, ItemOrigin.CONFIGURARE, Instant.now(), null);
        List<Item> reconciled = AutoItemReconciler.reconcile(List.of(altaCamera), baiaGresie(), () -> "new-id", Instant.now());
        assertThat(reconciled).contains(altaCamera);
    }
}
