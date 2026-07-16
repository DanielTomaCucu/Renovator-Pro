package ro.renovatorpro.application.usecase;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ro.renovatorpro.application.port.in.AddItemUseCase;
import ro.renovatorpro.application.port.in.AddRoomUseCase;
import ro.renovatorpro.application.port.in.ConvertProjectCurrencyUseCase;
import ro.renovatorpro.application.port.in.DeleteItemUseCase;
import ro.renovatorpro.application.port.in.GetProjectSummaryUseCase;
import ro.renovatorpro.application.port.in.DeleteRoomUseCase;
import ro.renovatorpro.application.port.in.GetItemsUseCase;
import ro.renovatorpro.application.port.in.GetProjectUseCase;
import ro.renovatorpro.application.port.in.GetRoomsUseCase;
import ro.renovatorpro.application.port.in.GetSpendingTimelineUseCase;
import ro.renovatorpro.application.port.in.Patch;
import ro.renovatorpro.application.port.in.UpdateItemUseCase;
import ro.renovatorpro.application.port.in.UpdateProjectUseCase;
import ro.renovatorpro.application.port.in.UpdateRoomUseCase;
import ro.renovatorpro.domain.model.Currency;
import ro.renovatorpro.domain.model.FlooringType;
import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemOrigin;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Project;
import ro.renovatorpro.domain.model.Room;
import ro.renovatorpro.domain.model.RoomType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Teste de use case cu repository-uri FAKE (in-memory, fără Spring/DB) — DoD Task 3.2:
 * delete room șterge items, update configurare reconciliază corect.
 */
class UseCasesTest {

    private static final String USER = "stub-user";
    private static final String PROJECT_ID = "p1";

    private FakeProjectRepository projectRepository;
    private FakeRoomRepository roomRepository;
    private FakeItemRepository itemRepository;
    private FakeIdGenerator idGenerator;
    private FakeTimeProvider timeProvider;

    private GetProjectUseCase getProject;
    private GetRoomsUseCase getRooms;
    private GetItemsUseCase getItems;
    private UpdateProjectUseCase updateProject;
    private AddRoomUseCase addRoom;
    private UpdateRoomUseCase updateRoom;
    private DeleteRoomUseCase deleteRoom;
    private AddItemUseCase addItem;
    private UpdateItemUseCase updateItem;
    private DeleteItemUseCase deleteItem;
    private ConvertProjectCurrencyUseCase convertCurrency;
    private GetProjectSummaryUseCase getSummary;
    private GetSpendingTimelineUseCase getSpendingTimeline;

    @BeforeEach
    void setUp() {
        projectRepository = new FakeProjectRepository();
        roomRepository = new FakeRoomRepository();
        itemRepository = new FakeItemRepository();
        idGenerator = new FakeIdGenerator();
        timeProvider = new FakeTimeProvider();

        projectRepository.seed(new Project(PROJECT_ID, "Proiectul Meu", Money.of(1000), Currency.EUR, null));

        getProject = new GetProjectService(projectRepository);
        getRooms = new GetRoomsService(roomRepository);
        getItems = new GetItemsService(roomRepository, itemRepository);
        updateProject = new UpdateProjectService(projectRepository);
        addRoom = new AddRoomService(roomRepository, idGenerator);
        updateRoom = new UpdateRoomService(roomRepository, itemRepository, idGenerator, timeProvider);
        deleteRoom = new DeleteRoomService(roomRepository, itemRepository);
        addItem = new AddItemService(itemRepository, idGenerator, timeProvider);
        updateItem = new UpdateItemService(itemRepository, timeProvider);
        deleteItem = new DeleteItemService(itemRepository);
        convertCurrency = new ConvertProjectCurrencyService(projectRepository, roomRepository, itemRepository);
        getSummary = new GetProjectSummaryService(projectRepository, roomRepository, itemRepository);
        getSpendingTimeline = new GetSpendingTimelineService(roomRepository, itemRepository);
    }

    @Test
    void getProjectRoomsItemsIntoarceStareaCurenta() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(500), null, null, null, null, null, null, null, null, null, null, null));
        addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Robinet", MaterialType.SANITARE, "",
                ItemStatus.PLANIFICAT, BigDecimal.ONE, Money.of(100), null, null, ItemOrigin.MANUAL));

        assertThat(getProject.execute(USER, PROJECT_ID).id()).isEqualTo(PROJECT_ID);
        assertThat(getRooms.execute(USER, PROJECT_ID)).hasSize(1);
        assertThat(getItems.execute(USER, PROJECT_ID)).hasSize(1);
    }

    @Test
    void updateProjectPatcheazaDoarCampurileFurnizate() {
        Project updated = updateProject.execute(USER, PROJECT_ID, new UpdateProjectUseCase.Command(
                "Renovare Completă", null, null, null));
        assertThat(updated.title()).isEqualTo("Renovare Completă");
        assertThat(updated.totalBudget().amount()).isEqualByComparingTo("1000.00"); // neschimbat
        assertThat(updated.currency()).isEqualTo(Currency.EUR); // neschimbat
    }

    @Test
    void addRoomGenereazaIdSiOSalveazaInProiect() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.DORMITOR, "Dormitor", Money.of(700), null, null, null, null, null, null, null, null, null, null, null));
        assertThat(room.id()).startsWith("generated-");
        assertThat(roomRepository.findByProjectId(PROJECT_ID)).contains(room);
    }

    @Test
    void deleteRoomStergeSiElementeleEi() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BUCATARIE, "Bucătărie", Money.of(2000), null, null, null, null, null, null, null, null, null, null, null));
        Item item = addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Gresie", MaterialType.GRESIE, "",
                ItemStatus.IN_ASTEPTARE, BigDecimal.TEN, Money.of(50), null, null, ItemOrigin.MANUAL));

        deleteRoom.execute(USER, room.id());

        assertThat(roomRepository.findById(room.id())).isEmpty();
        assertThat(itemRepository.findById(item.id())).isEmpty();
    }

    @Test
    void updateRoomFaraCampuriTehniceNuAtingeElementele() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.LIVING, "Living", Money.of(1500), null, null, null, null, null, null, null, null, null, null, null));
        Item manual = addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Canapea", MaterialType.MOBILA, "",
                ItemStatus.PLANIFICAT, BigDecimal.ONE, Money.of(800), null, null, ItemOrigin.MANUAL));

        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, "Living Renumit", null,
                Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent()));

        assertThat(roomRepository.findById(room.id()).orElseThrow().name()).isEqualTo("Living Renumit");
        assertThat(itemRepository.findById(manual.id())).isPresent(); // neatins
    }

    @Test
    void updateRoomCuCampuriTehniceGenereazaElementeAutoSiLeReconciliazaLaSchimbare() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(1200), null, null, null, null, null, null, null, null, null, null, null));

        // Prima configurare tehnică: pardoseală Parchet Laminat 10mp, perimetru 12m.
        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, null, null,
                Patch.of(FlooringType.PARCHET_LAMINAT), Patch.of(10.0), Patch.of(12.0),
                Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent()));

        var afterFirst = itemRepository.findByRoomId(room.id());
        assertThat(afterFirst).anyMatch(i -> i.materialType() == MaterialType.PARCHET);
        assertThat(afterFirst).anyMatch(i -> i.materialType() == MaterialType.PLINTA); // separată la Parchet

        // A doua configurare: schimbă suprafața — elementele Din Configurare trebuie recalculate, nu duplicate.
        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, null, null,
                Patch.of(FlooringType.PARCHET_LAMINAT), Patch.of(20.0), Patch.of(12.0),
                Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent()));

        var afterSecond = itemRepository.findByRoomId(room.id());
        long parchetCount = afterSecond.stream().filter(i -> i.materialType() == MaterialType.PARCHET).count();
        assertThat(parchetCount).isEqualTo(1); // recalculat pe loc, nu duplicat
    }

    @Test
    void updateRoomStergeElementeleAutoOrfaneCandMasuratoareaDispare() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(1200), null, null, null, null, null, null, null, null, null, null, null));
        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, null, null,
                Patch.of(FlooringType.PARCHET_LAMINAT), Patch.of(10.0), Patch.of(12.0),
                Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent()));
        assertThat(itemRepository.findByRoomId(room.id())).isNotEmpty();

        // Schimbare de material — Gresie nu mai produce Plintă separată (o include în pardoseală).
        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, null, null,
                Patch.of(FlooringType.GRESIE), Patch.absent(), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent()));

        var after = itemRepository.findByRoomId(room.id());
        assertThat(after).noneMatch(i -> i.materialType() == MaterialType.PLINTA); // orfană — ștearsă
    }

    @Test
    void updateRoomStergeExplicitUnCampTehnicOptionalPrinPatchOfNull() {
        // Problema 6 din audit: PATCH cu câmp absent nu trebuie confundat cu PATCH care șterge explicit.
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(1200), null, null, null, null, null, null, null, null, null, null, null));
        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, null, null,
                Patch.of(FlooringType.PARCHET_LAMINAT), Patch.of(10.0), Patch.of(12.0),
                Patch.absent(), Patch.absent(), Patch.absent(), Patch.of(2.5), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent()));
        assertThat(roomRepository.findById(room.id()).orElseThrow().baseboardHeight()).isEqualTo(2.5);

        // absent() → păstrează valoarea; of(null) → șterge explicit.
        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, null, null,
                Patch.absent(), Patch.absent(), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent()));
        assertThat(roomRepository.findById(room.id()).orElseThrow().baseboardHeight())
                .as("absent() nu modifică valoarea existentă").isEqualTo(2.5);

        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, null, null,
                Patch.absent(), Patch.absent(), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent(), Patch.of(null), Patch.absent(),
                Patch.absent(), Patch.absent(), Patch.absent()));
        assertThat(roomRepository.findById(room.id()).orElseThrow().baseboardHeight())
                .as("of(null) șterge explicit valoarea").isNull();
    }

    @Test
    void addUpdateDeleteItemCrudDeBaza() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BALCON, "Balcon", Money.of(300), null, null, null, null, null, null, null, null, null, null, null));
        Item item = addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Gresie", MaterialType.GRESIE, "Dedeman",
                ItemStatus.IN_ASTEPTARE, BigDecimal.TEN, Money.of(40), null, null, ItemOrigin.MANUAL));

        Item updated = updateItem.execute(USER, item.id(), new UpdateItemUseCase.Command(
                null, null, null, ItemStatus.CUMPARAT, null, null, null, null));
        assertThat(updated.status()).isEqualTo(ItemStatus.CUMPARAT);
        assertThat(updated.name()).isEqualTo("Gresie"); // neschimbat

        deleteItem.execute(USER, item.id());
        assertThat(itemRepository.findById(item.id())).isEmpty();
    }

    @Test
    void convertCurrencyConvertesteTotBugetulCamereleSiElementele() {
        // Proiect seedat: EUR, buget 1000. Adăugăm o cameră (buget 500) și un element (preț 100 EUR).
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(500), null, null, null, null, null, null, null, null, null, null, null));
        Item item = addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Robinet", MaterialType.SANITARE, "",
                ItemStatus.PLANIFICAT, BigDecimal.ONE, Money.of(100), null, null, ItemOrigin.MANUAL));

        // Conversie EUR → RON la 5.00: toate sumele × 5.
        Project result = convertCurrency.execute(USER, PROJECT_ID,
                new ConvertProjectCurrencyUseCase.Command(Currency.RON, new BigDecimal("5.00")));

        assertThat(result.currency()).isEqualTo(Currency.RON);
        assertThat(result.totalBudget().amount()).isEqualByComparingTo("5000.00");
        assertThat(projectRepository.findById(PROJECT_ID).orElseThrow().currency()).isEqualTo(Currency.RON);
        assertThat(roomRepository.findById(room.id()).orElseThrow().allocatedBudget().amount()).isEqualByComparingTo("2500.00");
        assertThat(itemRepository.findById(item.id()).orElseThrow().unitPrice().amount()).isEqualByComparingTo("500.00");
    }

    @Test
    void summaryAgregaTotalurileCumpparatulSiDistributiile() {
        Room baie = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(500), null, null, null, null, null, null, null, null, null, null, null));
        // 2 × 100 = 200 estimat, Cumparat → cheltuit
        addItem.execute(USER, new AddItemUseCase.Command(baie.id(), "Gresie", MaterialType.GRESIE, "",
                ItemStatus.CUMPARAT, BigDecimal.valueOf(2), Money.of(100), null, null, ItemOrigin.MANUAL));
        // 1 × 300 = 300 estimat, NEcumpărat → nu intră la cheltuit
        addItem.execute(USER, new AddItemUseCase.Command(baie.id(), "Robinet", MaterialType.SANITARE, "",
                ItemStatus.PLANIFICAT, BigDecimal.ONE, Money.of(300), null, null, ItemOrigin.MANUAL));

        GetProjectSummaryUseCase.ProjectSummary s = getSummary.execute(USER, PROJECT_ID);

        assertThat(s.totalEstimated().amount()).isEqualByComparingTo("500.00"); // 200 + 300
        assertThat(s.totalSpent().amount()).isEqualByComparingTo("200.00");     // doar Cumparat
        assertThat(s.budgetRemaining()).isEqualByComparingTo("800.00");         // 1000 buget − 200 cheltuit
        assertThat(s.boughtCount()).isEqualTo(1);
        assertThat(s.purchaseProgress()).isEqualTo(50);                          // 1 din 2 elemente
        assertThat(s.costPerRoom()).singleElement()
                .satisfies(rc -> assertThat(rc.total().amount()).isEqualByComparingTo("500.00"));
        assertThat(s.costPerCategory()).containsKey(MaterialType.GRESIE).containsKey(MaterialType.SANITARE);
    }

    @Test
    void addItemSeteazaCreatedAtSiPurchasedAtDoarDacaEDejaCumparat() {
        timeProvider.set(Instant.parse("2026-03-01T10:00:00Z"));
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(500), null, null, null, null, null, null, null, null, null, null, null));

        Item planificat = addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Robinet", MaterialType.SANITARE, "",
                ItemStatus.PLANIFICAT, BigDecimal.ONE, Money.of(100), null, null, ItemOrigin.MANUAL));
        assertThat(planificat.createdAt()).isEqualTo(Instant.parse("2026-03-01T10:00:00Z"));
        assertThat(planificat.purchasedAt()).isNull();

        Item cumparatDejaLaCreare = addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Gresie", MaterialType.GRESIE, "",
                ItemStatus.CUMPARAT, BigDecimal.TEN, Money.of(50), null, null, ItemOrigin.MANUAL));
        assertThat(cumparatDejaLaCreare.purchasedAt()).isEqualTo(cumparatDejaLaCreare.createdAt());
    }

    @Test
    void updateItemSeteazaPurchasedAtDoarLaTranzitieSpreCumparat() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(500), null, null, null, null, null, null, null, null, null, null, null));
        timeProvider.set(Instant.parse("2026-01-10T00:00:00Z"));
        Item item = addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Gresie", MaterialType.GRESIE, "",
                ItemStatus.PLANIFICAT, BigDecimal.TEN, Money.of(50), null, null, ItemOrigin.MANUAL));
        assertThat(item.purchasedAt()).isNull();

        timeProvider.set(Instant.parse("2026-02-15T00:00:00Z"));
        Item cumparat = updateItem.execute(USER, item.id(), new UpdateItemUseCase.Command(
                null, null, null, ItemStatus.CUMPARAT, null, null, null, null));
        assertThat(cumparat.purchasedAt()).isEqualTo(Instant.parse("2026-02-15T00:00:00Z"));

        // Editare ulterioară fără schimbare de status reală (rămâne Cumparat) — purchasedAt NU se reîmprospătează.
        timeProvider.set(Instant.parse("2026-03-01T00:00:00Z"));
        Item redenumit = updateItem.execute(USER, item.id(), new UpdateItemUseCase.Command(
                "Gresie Premium", null, null, ItemStatus.CUMPARAT, null, null, null, null));
        assertThat(redenumit.purchasedAt()).isEqualTo(Instant.parse("2026-02-15T00:00:00Z"));

        // Revenire la Planificat — purchasedAt rămâne (istoric), createdAt neschimbat.
        Item revenit = updateItem.execute(USER, item.id(), new UpdateItemUseCase.Command(
                null, null, null, ItemStatus.PLANIFICAT, null, null, null, null));
        assertThat(revenit.purchasedAt()).isEqualTo(Instant.parse("2026-02-15T00:00:00Z"));
        assertThat(revenit.createdAt()).isEqualTo(Instant.parse("2026-01-10T00:00:00Z"));
    }

    @Test
    void spendingTimelineAgregaCumulativPeLunaCumparariiDoarElementeleCumparate() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(500), null, null, null, null, null, null, null, null, null, null, null));

        // Ianuarie: 2 × 50 = 100 cumpărat.
        timeProvider.set(Instant.parse("2026-01-15T00:00:00Z"));
        Item ian = addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Gresie", MaterialType.GRESIE, "",
                ItemStatus.CUMPARAT, BigDecimal.valueOf(2), Money.of(50), null, null, ItemOrigin.MANUAL));

        // Februarie: 1 × 300 = 300 cumpărat → cumulativ 400.
        timeProvider.set(Instant.parse("2026-02-10T00:00:00Z"));
        addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Robinet", MaterialType.SANITARE, "",
                ItemStatus.CUMPARAT, BigDecimal.ONE, Money.of(300), null, null, ItemOrigin.MANUAL));

        // Element NEcumpărat — ignorat de serie.
        addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Oglindă", MaterialType.ALTELE, "",
                ItemStatus.PLANIFICAT, BigDecimal.ONE, Money.of(999), null, null, ItemOrigin.MANUAL));

        var timeline = getSpendingTimeline.execute(USER, PROJECT_ID);

        assertThat(timeline).hasSize(2);
        assertThat(timeline.get(0).month()).isEqualTo(YearMonth.of(2026, 1));
        assertThat(timeline.get(0).cumulativeSpent().amount()).isEqualByComparingTo("100.00");
        assertThat(timeline.get(1).month()).isEqualTo(YearMonth.of(2026, 2));
        assertThat(timeline.get(1).cumulativeSpent().amount()).isEqualByComparingTo("400.00"); // cumulativ

        // Sanity: elementul din ianuarie chiar există și e Cumparat (evită un test fals-pozitiv).
        assertThat(ian.status()).isEqualTo(ItemStatus.CUMPARAT);
    }

    @Test
    void spendingTimelineEsteGoalaCandNimicNuECumparat() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(500), null, null, null, null, null, null, null, null, null, null, null));
        addItem.execute(USER, new AddItemUseCase.Command(room.id(), "Robinet", MaterialType.SANITARE, "",
                ItemStatus.PLANIFICAT, BigDecimal.ONE, Money.of(100), null, null, ItemOrigin.MANUAL));

        assertThat(getSpendingTimeline.execute(USER, PROJECT_ID)).isEmpty();
    }
}
