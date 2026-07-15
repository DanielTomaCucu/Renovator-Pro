package ro.renovatorpro.application.usecase;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ro.renovatorpro.application.port.in.AddItemUseCase;
import ro.renovatorpro.application.port.in.AddRoomUseCase;
import ro.renovatorpro.application.port.in.DeleteItemUseCase;
import ro.renovatorpro.application.port.in.DeleteRoomUseCase;
import ro.renovatorpro.application.port.in.GetItemsUseCase;
import ro.renovatorpro.application.port.in.GetProjectUseCase;
import ro.renovatorpro.application.port.in.GetRoomsUseCase;
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

    @BeforeEach
    void setUp() {
        projectRepository = new FakeProjectRepository();
        roomRepository = new FakeRoomRepository();
        itemRepository = new FakeItemRepository();
        idGenerator = new FakeIdGenerator();

        projectRepository.seed(new Project(PROJECT_ID, "Proiectul Meu", Money.of(1000), Currency.EUR, null));

        getProject = new GetProjectService(projectRepository);
        getRooms = new GetRoomsService(roomRepository);
        getItems = new GetItemsService(roomRepository, itemRepository);
        updateProject = new UpdateProjectService(projectRepository);
        addRoom = new AddRoomService(roomRepository, idGenerator);
        updateRoom = new UpdateRoomService(roomRepository, itemRepository, idGenerator);
        deleteRoom = new DeleteRoomService(roomRepository, itemRepository);
        addItem = new AddItemService(itemRepository, idGenerator);
        updateItem = new UpdateItemService(itemRepository);
        deleteItem = new DeleteItemService(itemRepository);
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
                null, "Living Renumit", null, null, null, null, null, null, null, null, null, null, null, null));

        assertThat(roomRepository.findById(room.id()).orElseThrow().name()).isEqualTo("Living Renumit");
        assertThat(itemRepository.findById(manual.id())).isPresent(); // neatins
    }

    @Test
    void updateRoomCuCampuriTehniceGenereazaElementeAutoSiLeReconciliazaLaSchimbare() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(1200), null, null, null, null, null, null, null, null, null, null, null));

        // Prima configurare tehnică: pardoseală Parchet Laminat 10mp, perimetru 12m.
        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, null, null, FlooringType.PARCHET_LAMINAT, 10.0, 12.0, null, null, null, null, null, null, null, null));

        var afterFirst = itemRepository.findByRoomId(room.id());
        assertThat(afterFirst).anyMatch(i -> i.materialType() == MaterialType.PARCHET);
        assertThat(afterFirst).anyMatch(i -> i.materialType() == MaterialType.PLINTA); // separată la Parchet

        // A doua configurare: schimbă suprafața — elementele Din Configurare trebuie recalculate, nu duplicate.
        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, null, null, FlooringType.PARCHET_LAMINAT, 20.0, 12.0, null, null, null, null, null, null, null, null));

        var afterSecond = itemRepository.findByRoomId(room.id());
        long parchetCount = afterSecond.stream().filter(i -> i.materialType() == MaterialType.PARCHET).count();
        assertThat(parchetCount).isEqualTo(1); // recalculat pe loc, nu duplicat
    }

    @Test
    void updateRoomStergeElementeleAutoOrfaneCandMasuratoareaDispare() {
        Room room = addRoom.execute(USER, PROJECT_ID, new AddRoomUseCase.Command(RoomType.BAIE, "Baie", Money.of(1200), null, null, null, null, null, null, null, null, null, null, null));
        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, null, null, FlooringType.PARCHET_LAMINAT, 10.0, 12.0, null, null, null, null, null, null, null, null));
        assertThat(itemRepository.findByRoomId(room.id())).isNotEmpty();

        // Configurare ștearsă complet (floorArea null explicit nu se poate distinge de "unset" în Command,
        // deci testăm cu floorMaterial diferit care nu mai produce Plintă separată — Gresie o include în pardoseală).
        updateRoom.execute(USER, room.id(), new UpdateRoomUseCase.Command(
                null, null, null, FlooringType.GRESIE, null, null, null, null, null, null, null, null, null, null));

        var after = itemRepository.findByRoomId(room.id());
        assertThat(after).noneMatch(i -> i.materialType() == MaterialType.PLINTA); // orfană — ștearsă
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
}
