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
import ro.renovatorpro.domain.model.TileSize;
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

    // --- ZUG-BE-3: cele 7 elemente auto-generate noi (docs/cerinte-zugraveli.md) ---

    private Room baieGresieCuTavanSiFaiantaCompleta() {
        return Room.builder("r1", RoomType.BAIE, "Baie", Money.of(1500))
                .floorMaterial(FlooringType.GRESIE)
                .floorArea(6.0)
                .tileSize(TileSize.MARE)
                .ceilingPaint(true)
                .wallTiling(new WallTiling(2, 1.5, Map.of(Wall.NORD, 3.0, Wall.EST, 3.0), 2.5, TileSize.MARE))
                .build();
    }

    @Test
    void generateAutoItemsProduceVopseaAgregataInLitriInclusivLaGresie() {
        List<AutoItemReconciler.ItemDraft> drafts = AutoItemReconciler.generateAutoItems(baieGresieCuTavanSiFaiantaCompleta());
        assertThat(drafts).anySatisfy(d -> {
            assertThat(d.materialType()).isEqualTo(MaterialType.VOPSEA);
            assertThat(d.name()).contains("tavan").contains("deasupra faianței");
            assertThat(d.quantity()).isEqualByComparingTo("2.50");
        });
    }

    @Test
    void generateAutoItemsProduceAmorsaZugravealaSiAmorsaPlacariSeparat() {
        List<AutoItemReconciler.ItemDraft> drafts = AutoItemReconciler.generateAutoItems(baieGresieCuTavanSiFaiantaCompleta());
        long amorsaCount = drafts.stream().filter(d -> d.materialType() == MaterialType.AMORSA).count();
        assertThat(amorsaCount).isEqualTo(2);
        assertThat(drafts).anySatisfy(d -> {
            assertThat(d.materialType()).isEqualTo(MaterialType.AMORSA);
            assertThat(d.name()).isEqualTo("Amorsă zugrăveală");
        });
        assertThat(drafts).anySatisfy(d -> {
            assertThat(d.materialType()).isEqualTo(MaterialType.AMORSA);
            assertThat(d.name()).isEqualTo("Amorsă placări");
        });
    }

    @Test
    void generateAutoItemsProduceAdezivComunSiChitDeRosturi() {
        List<AutoItemReconciler.ItemDraft> drafts = AutoItemReconciler.generateAutoItems(baieGresieCuTavanSiFaiantaCompleta());
        assertThat(drafts).anySatisfy(d -> {
            assertThat(d.materialType()).isEqualTo(MaterialType.ADEZIV_PLACARI);
            assertThat(d.quantity()).isEqualByComparingTo("4.00");
        });
        assertThat(drafts).anySatisfy(d -> {
            assertThat(d.materialType()).isEqualTo(MaterialType.CHIT_ROSTURI);
            assertThat(d.quantity()).isEqualByComparingTo("2.00");
        });
    }

    @Test
    void generateAutoItemsRedenumesteFolieParchetDupaUnderfloorHeating() {
        Room faraIncalzire = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT).floorArea(10.0).underfloorHeating(false).build();
        Room cuIncalzire = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1000))
                .floorMaterial(FlooringType.PARCHET_LAMINAT).floorArea(10.0).underfloorHeating(true).build();

        List<AutoItemReconciler.ItemDraft> faraDrafts = AutoItemReconciler.generateAutoItems(faraIncalzire);
        List<AutoItemReconciler.ItemDraft> cuDrafts = AutoItemReconciler.generateAutoItems(cuIncalzire);

        assertThat(faraDrafts).anySatisfy(d -> {
            assertThat(d.materialType()).isEqualTo(MaterialType.FOLIE_PARCHET);
            assertThat(d.name()).contains("XPS");
        });
        assertThat(cuDrafts).anySatisfy(d -> {
            assertThat(d.materialType()).isEqualTo(MaterialType.FOLIE_PARCHET);
            assertThat(d.name()).contains("încălzire în pardoseală");
        });
    }

    @Test
    void reconcileAtribuieIdSeparatCeloDouaElementeDeAmorsaCuAcelasiMaterialType() {
        Room room = baieGresieCuTavanSiFaiantaCompleta();
        AtomicInteger counter = new AtomicInteger();
        List<Item> reconciled = AutoItemReconciler.reconcile(List.of(), room,
                () -> "generated-" + counter.incrementAndGet(), Instant.now());

        List<Item> amorsaItems = reconciled.stream().filter(i -> i.materialType() == MaterialType.AMORSA).toList();
        assertThat(amorsaItems).hasSize(2);
        // fiecare Amorsă are id propriu — niciun id duplicat/pierdut din coliziunea de materialType.
        assertThat(amorsaItems.stream().map(Item::id).distinct()).hasSize(2);
    }

    @Test
    void reconcilePastreazaPretulSiStatusulSeparatPentruFiecareAmorsaLaRecalcul() {
        Room room = baieGresieCuTavanSiFaiantaCompleta();
        Item amorsaZugraveala = new Item("amorsa-zug", "r1", "Amorsă zugrăveală", MaterialType.AMORSA,
                "Dedeman", ItemStatus.CUMPARAT, BigDecimal.ONE, Money.of(30), null, null,
                ItemOrigin.CONFIGURARE, Instant.now(), Instant.now());
        Item amorsaPlacari = new Item("amorsa-plac", "r1", "Amorsă placări", MaterialType.AMORSA,
                "Leroy Merlin", ItemStatus.PLANIFICAT, BigDecimal.ONE, Money.of(45), null, null,
                ItemOrigin.CONFIGURARE, Instant.now(), null);
        List<Item> reconciled = AutoItemReconciler.reconcile(List.of(amorsaZugraveala, amorsaPlacari), room,
                () -> "new-id", Instant.now());

        Item zugravealaDupa = reconciled.stream().filter(i -> i.id().equals("amorsa-zug")).findFirst().orElseThrow();
        Item placariDupa = reconciled.stream().filter(i -> i.id().equals("amorsa-plac")).findFirst().orElseThrow();
        assertThat(zugravealaDupa.unitPrice().amount()).isEqualByComparingTo("30.00");
        assertThat(zugravealaDupa.status()).isEqualTo(ItemStatus.CUMPARAT);
        assertThat(zugravealaDupa.source()).isEqualTo("Dedeman");
        assertThat(placariDupa.unitPrice().amount()).isEqualByComparingTo("45.00");
        assertThat(placariDupa.status()).isEqualTo(ItemStatus.PLANIFICAT);
        assertThat(placariDupa.source()).isEqualTo("Leroy Merlin");
    }

    @Test
    void reconcileStergeAmorsaPlacariCandNuMaiEPlacareDarPastreazaAmorsaZugraveala() {
        // Parchet (nu Gresie) + fără wallTiling -> fără nicio suprafață de placat -> Amorsă placări dispare;
        // tavanul zugrăvit (orice pardoseală) tot cere Amorsă zugrăveală.
        Room roomFaraFaianta = Room.builder("r1", RoomType.DORMITOR, "Dormitor", Money.of(1500))
                .floorMaterial(FlooringType.PARCHET_LAMINAT)
                .floorArea(6.0)
                .ceilingPaint(true)
                .build();
        Item amorsaZugraveala = new Item("amorsa-zug", "r1", "Amorsă zugrăveală", MaterialType.AMORSA,
                "", ItemStatus.IN_ASTEPTARE, BigDecimal.ONE, Money.zero(), null, null,
                ItemOrigin.CONFIGURARE, Instant.now(), null);
        Item amorsaPlacari = new Item("amorsa-plac", "r1", "Amorsă placări", MaterialType.AMORSA,
                "", ItemStatus.IN_ASTEPTARE, BigDecimal.ONE, Money.zero(), null, null,
                ItemOrigin.CONFIGURARE, Instant.now(), null);
        List<Item> reconciled = AutoItemReconciler.reconcile(List.of(amorsaZugraveala, amorsaPlacari), roomFaraFaianta,
                () -> "new-id", Instant.now());

        assertThat(reconciled).anyMatch(i -> i.id().equals("amorsa-zug"));
        assertThat(reconciled).noneMatch(i -> i.id().equals("amorsa-plac"));
    }

    private static Item item(String id, String roomId, MaterialType materialType, ItemOrigin origin, Instant createdAt) {
        return new Item(id, roomId, "Element " + id, materialType, "", ItemStatus.IN_ASTEPTARE,
                BigDecimal.ONE, Money.zero(), null, null, origin, createdAt, null);
    }

    @Test
    void resolveLinkedItemGasesteUnicSingurCandidat() {
        Item parchet = item("i1", "r1", MaterialType.PARCHET, ItemOrigin.CONFIGURARE, Instant.now());
        Item altaCamera = item("i2", "r2", MaterialType.PARCHET, ItemOrigin.CONFIGURARE, Instant.now());
        Item alteMaterial = item("i3", "r1", MaterialType.GRESIE, ItemOrigin.CONFIGURARE, Instant.now());

        Item found = AutoItemReconciler.resolveLinkedItem(List.of(parchet, altaCamera, alteMaterial), "r1", MaterialType.PARCHET);

        assertThat(found.id()).isEqualTo("i1");
    }

    @Test
    void resolveLinkedItemFaraCandidatiIntoarceNull() {
        Item mobila = item("i1", "r1", MaterialType.MOBILA, ItemOrigin.MANUAL, Instant.now());

        Item found = AutoItemReconciler.resolveLinkedItem(List.of(mobila), "r1", MaterialType.MOBILA);

        assertThat(found).isNull(); // MOBILA nu vine niciodată din configurator -> item Manual nu se leagă
    }

    @Test
    void resolveLinkedItemIgnoraElementeleDinComparatorSauManuale() {
        Item dinComparator = item("i1", "r1", MaterialType.PARCHET, ItemOrigin.COMPARATOR, Instant.now());
        Item manual = item("i2", "r1", MaterialType.PARCHET, ItemOrigin.MANUAL, Instant.now());

        Item found = AutoItemReconciler.resolveLinkedItem(List.of(dinComparator, manual), "r1", MaterialType.PARCHET);

        assertThat(found).isNull();
    }

    @Test
    void resolveLinkedItemCuMaiMultiCandidatiAlegePrimulDupaCreatedAt() {
        Instant t0 = Instant.parse("2026-01-01T00:00:00Z");
        Item amorsaZugraveala = item("amorsa-zug", "r1", MaterialType.AMORSA, ItemOrigin.CONFIGURARE, t0);
        Item amorsaPlacari = item("amorsa-plac", "r1", MaterialType.AMORSA, ItemOrigin.CONFIGURARE, t0.plusSeconds(60));

        Item found = AutoItemReconciler.resolveLinkedItem(List.of(amorsaPlacari, amorsaZugraveala), "r1", MaterialType.AMORSA);

        assertThat(found.id()).isEqualTo("amorsa-zug"); // creat primul
    }
}
